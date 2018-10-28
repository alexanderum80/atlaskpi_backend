import { AggregateStage } from './../app_modules/kpis/queries/aggregate';
import { KPIExpressionHelper } from './../domain/app/kpis/kpi-expression.helper';
import { IDateRange, parsePredefinedDate, IChartDateRange } from '../domain/common/date-range';
import { CurrentUser } from '../domain/app/current-user';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { injectable, inject } from 'inversify';
import { chain, Dictionary, isEmpty, keyBy, isString, isObject, filter, sortBy, isArray, isDate } from 'lodash';
import {ZipsToMap} from '../domain/master/zip-to-map/zip-to-map.model';
import {ISaleByZip, ISaleByZipGrouping, TypeMap} from '../domain/app/sales/sale';
import {NULL_CATEGORY_REPLACEMENT} from '../app_modules/charts/queries/charts/ui-chart-base';
import {MapMarkerItemList, MapMarker, MapMarkerGroupingInput} from '../app_modules/maps/map.types';
import {IZipToMapDocument} from '../domain/master/zip-to-map/zip-to-map';
import { IFieldMetadata, IVirtualSourceDocument, IVirtualSourceFields } from '../domain/app/virtual-sources/virtual-source';
import {IObject} from '../app_modules/shared/criteria.plugin';
import {KPIFilterHelper} from '../domain/app/kpis/kpi-filter.helper';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import {getProjectOptions, findStage } from '../domain/common/fields-with-data';
import { lowerCaseFirst, camelCase } from 'change-case';
import { Maps } from '../domain/app/maps/maps.model';
import { KPIs } from '../domain/app/kpis/kpi.model';
import { IKPIDocument, KPITypeEnum } from '../domain/app/kpis/kpi';
import { Connectors } from '../domain/master/connectors/connector.model';
import { IConnectorDocument } from '../domain/master/connectors/connector';
import { KpiService } from './kpi.service';
import { AppConnection } from '../domain/app/app.connection';

export interface IMapMarker {
    name: string;
    lat: number;
    lng: number;
    color: string;
    value: number;
}

export interface IMapMarkerAggregate {
    $match?: Object;
    $project?: Object;
    $unwind?: Object;
    $group?: Object;
}

interface IVirtualSourceInfoFields {
    // i.e. Referral
    name: string;
    // i.e. referralMain
    path: string;
    // i.e. category from category.name
    nonDotPath: string;
    // Array|String
    type: string;
}

interface IVirtualSourceFieldsInfo {
    field: IVirtualSourceInfoFields;
    aggregate: any[];
}

const REVENUE_BY_REFERRALS = 'revenue_by_referrals';

@injectable()
export class MapMarkerService {

    constructor(
        @inject(AppConnection.name) private _appConnection: AppConnection,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(KpiService.name) private _kpiservice: KpiService,
        @inject(Maps.name) private _maps: Maps,
        @inject(ZipsToMap.name) private _ZipToMaps: ZipsToMap,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources,
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(CurrentUser.name) private _user: CurrentUser
        ) { }

        private aggregate: AggregateStage[] = this._getDefaultAggregate();

        private _getDefaultAggregate(): AggregateStage[] {
            return [
                    {
                        $match: { 'product.amount' : { '$gte' : 0} }
                    },
                    {
                        $project: { 'product': 1, '_id': 0, 'customer': 1 }
                    },
                    { '$unwind': {}
                    },
                    {
                        $group: {
                            _id: { customerZip: '$customer.zip' }, values: {'$sum': '$product.amount'}
                        }
                    }
            ];
        }

        public listMaps(): Promise<any[]> {
            const that = this;
            return new Promise<any[]>((resolve, reject) => {
                that._maps.model
                .find({})
                .then(mapDocuments => {
                    return resolve(mapDocuments);
                })
                .catch(err => {
                    return reject(err);
                });
            });
        }

        private getModel(modelName: string, source: string): any {
            const schema = new mongoose.Schema({}, { strict: false });
            const connection: mongoose.Connection = this._appConnection.get;
            const model = connection.model(modelName, schema, source);
            return model;
        }

        public executeAggregate(model: any, parameters: any): Promise<any[]> {
            return new Promise<any[]>((resolve, reject) => {
                const agg = model.aggregate(parameters);
                agg.options = { allowDiskUse: true };
                agg.then(result => {
                    return resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
            });
        }
        async getMapMarkers(dataTypeMap: TypeMap, input: MapMarkerGroupingInput): Promise<IMapMarker[]> {
            try {

                const allKpis: IKPIDocument[] = await this._kpis.model.find({});
                const kpi: IKPIDocument = allKpis.find((k: IKPIDocument) => k.id === input.kpi);
                const connectors: IConnectorDocument[] = await this._connectors.model.find({});
                const kpiSources: string[] = this._kpiservice._getKpiSources(kpi, allKpis, connectors);
                const vs: IVirtualSourceDocument[] = await this._virtualSources.model.find({});
                const virtualSources: IVirtualSourceDocument[] = vs.filter((v: IVirtualSourceDocument) => {
                    return kpiSources.indexOf(v.name.toLocaleLowerCase()) !== -1;
                });
                const theModel = this.getModel(virtualSources[0].name, virtualSources[0].source);

                this.aggregate = await this._getAggregateObject(kpi, input, virtualSources[0]);

                if (isEmpty(this.aggregate)) {
                    return [];
                }
                const resultByZip = await this.executeAggregate(theModel, this.aggregate);
                // get the zip codes related
                const zipList = await this._ZipToMaps.model.find({
                                    zipCode: {
                                        $in: <any> resultByZip.map(d => d._id.grouping)
                                    }});
                let markers;

                if (input) {
                    const groupByField = input['grouping'];
                    if (groupByField) {
                        markers = this._groupingMarkersFormatted(resultByZip, zipList, groupByField);
                    } else {
                        markers = this._noGroupingsMarkersFormatted(resultByZip, zipList);
                    }
                } else {
                    markers = this._noGroupingsMarkersFormatted(resultByZip, zipList);
                }

                return markers;
            } catch (err) {
                console.error(err);
                return [];
            }
        }

        private async _getAggregateObject(kpi: IKPIDocument, input: MapMarkerGroupingInput, vs: any): Promise<any[]> {
            try {
                if (!input) {
                    input = new MapMarkerGroupingInput();
                    input.grouping = 'customer.zip';
                }
                if (input.kpi) {
                   this._updateAggregateWithKPIData(kpi, input, vs);
                }
                if (input && isObject(input)) {

                    const vsFieldsInfo: IVirtualSourceFieldsInfo = this._vsFieldsInfo(vs, input.grouping);

                    this._updateAggregate(input, vs, vsFieldsInfo);

                    if (this._sortByUnwind(vsFieldsInfo)) {
                        this._getSortedAggregate();
                    }
                }

                this._filterEmptyUnwindPipe();
                return this.aggregate;
            } catch (err) {
                console.error(err);
                throw new Error('error getting aggregate object');
            }
        }

        protected findStage(stageOperator: string): AggregateStage {
            return this.aggregate.find(s => s[stageOperator] !== undefined);
        }

        protected findStages(stageOperator: string): AggregateStage[] {
            return this.aggregate.filter(s => s[stageOperator] !== undefined);
        }

        private replacementString = [
            { key: '__dot__', value: '.' },
            { key: '__dollar__', value: '$' }
        ];

        private _isRegExpOperator(operator: string): boolean {
            const regexStrings = ['startWith', 'endWith', 'contains', 'regex'];
            return regexStrings.indexOf(operator) !== -1;
        }
        private _injectMatch(expField: string) {
            let matchStage = this.findStage('$match');
            matchStage.$match[expField] = { $gte: 0 };
        }

        private _injectFilter(filter: any) {
            let matchStage = this.findStage('$match');
            let cleanFilter = this._cleanFilter(filter);

            if (!matchStage) {
                return;
            }

            Object.keys(cleanFilter).forEach(filterKey => {
                // do not add top to the filter, that gets applied in the end
                if (filterKey === 'top') return;
                matchStage.$match[filterKey] = cleanFilter[filterKey];
            });
        }

        protected _cleanFilter(filter: any): any {
            let newFilter = {};

            if (isString(filter)) {
                return filter;
            }

            Object.keys(filter).forEach(filterKey => {

                let key = filterKey;
                this.replacementString.forEach(r => key = key.replace(r.key, r.value));
                let value = filter[filterKey];

                if (!isArray(value) && !isDate(value) && isObject(value)) {
                    newFilter[key] = this._cleanFilter(value);
                } else if (!isDate(value) && isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        value[i] = this._cleanFilter(value[i]);
                    }
                    newFilter[key] = value;
                } else {
                    // apply filter
                    let filterValue = filter[filterKey];
                    const operatorName = filterKey.replace(/__dot__|__dollar__/g, '');
                    if (this._isRegExpOperator(operatorName)) {
                        // process filter value
                        if (operatorName.indexOf('start') !== -1) {
                            filterValue = '^' + filterValue;
                        }
                        if (operatorName.indexOf('end') !== -1) {
                            filterValue = filterValue + '$';
                        }
                        key = '$regex';
                        if (operatorName === 'regex') {
                            value = new RegExp(filterValue);
                        } else {
                            value = new RegExp(filterValue, 'i');
                        }
                    } else {
                        value = filterValue;
                    }
                    newFilter[key] = value;
                }
            });
            return newFilter;
        }

        private _injectProject(vs: any, expression: any ) {
            const dateField = vs.dateField.split('.')[0];
            const expField: string = expression.field.split('.')[0];
            const projectStage = this.findStage('$project');
            projectStage.$project = {};
            projectStage.$project[dateField] = 1;
            projectStage.$project._id = 0;
            projectStage.$project.customer = 1;
            let index = Object.keys(projectStage.$project).findIndex(prop => prop === expField);
            if (index === -1) {
                projectStage.$project[expField] = 1;
            }
        }

        private _injectGroup(grouping: string, expression: any) {
            const expField: string = expression.field.split('.')[0];
            const groupStage = this.findStage('$group');
            const groupingStr = camelCase(grouping);
            groupStage.$group._id = {};
            groupStage.$group._id[groupingStr] = '$' + grouping;
            groupStage.$group.values = {};
            if (expression.function === 'count') {
                groupStage.$group.values['$sum'] = 1;
            } else {
                groupStage.$group.values['$' + expression.function] = '$' + expression.field;
            }
        }

        private _updateAggregateWithKPIData(kpi: IKPIDocument, input: MapMarkerGroupingInput, vs: any) {

            let typeEnum;
            switch (kpi.type) {
                case 'simple':
                    typeEnum = KPITypeEnum.Simple;
                    break;
                case 'complex':
                    typeEnum = KPITypeEnum.Complex;
                    break;
                case 'externalsource':
                    typeEnum = KPITypeEnum.ExternalSource;
                    break;
                default:
                    typeEnum = KPITypeEnum.Compound;
                    break;
            }
            // Here I must looks for kpi expression
            const expression = KPIExpressionHelper.DecomposeExpression(typeEnum, kpi.expression);
            let matchStage = this.findStage('$match');
            matchStage.$match = {};
            if (kpi.filter) {
                this._injectFilter(kpi.filter);
            }
            if (expression) {
                this._injectMatch(expression.field);
                this._injectProject(vs, expression);
                this._injectGroup(input.grouping, expression);
            }
        }
        private _sortByUnwind(vsFieldsInfo: IVirtualSourceFieldsInfo): boolean {
            const projectStage = findStage(this.aggregate, '$project');
            if (!projectStage || !projectStage.$project) {
                return false;
            }

            const pipline = projectStage.$project;
            const pipelineKeys: string[] = Object.keys(pipline);

            if (isEmpty(vsFieldsInfo)) {
                return false;
            }

            return pipelineKeys.indexOf(vsFieldsInfo.field.nonDotPath) !== -1;
        }

        private _getSortedAggregate() {
            let agg: IMapMarkerAggregate[] = sortBy(this.aggregate, '$project');
            const unwindStage: IMapMarkerAggregate = findStage(this.aggregate, '$unwind');

            agg = agg.filter(a => !a.$unwind);
            agg.unshift(unwindStage);

            this.aggregate = agg;
        }

        private _filterEmptyUnwindPipe() {
            const unwindStage: IMapMarkerAggregate = findStage(this.aggregate, '$unwind');

            if (isEmpty(unwindStage.$unwind)) {
                delete unwindStage.$unwind;
            }

            this.aggregate = filter(this.aggregate, (agg) => !isEmpty(agg));
        }

        private _vsFieldsInfo(virtualSource: IVirtualSourceDocument, groupByField: string): IVirtualSourceFieldsInfo {
            if (isEmpty(virtualSource) || !groupByField) {
                return {} as IVirtualSourceFieldsInfo;
            }
            const fieldsMap: IVirtualSourceFields = virtualSource.fieldsMap;
            const fieldMetadata: IFieldMetadata = fieldsMap[groupByField];
            let aggregate = [];

            if (virtualSource.aggregate) {
                aggregate = virtualSource.aggregate.map(a => {
                    return KPIFilterHelper.CleanObjectKeys(a);
                });
            }

            if (!fieldMetadata) {
                return {} as IVirtualSourceFieldsInfo;
            }

            const dataType = this._getDataType(fieldMetadata, aggregate);
            const nonDotPath = fieldMetadata.path.split('.')[0];

            return {
                field: {
                    name: groupByField,
                    path: fieldMetadata.path,
                    nonDotPath: nonDotPath,
                    type: dataType
                },
                aggregate: aggregate
            };
        }

        private _updateAggregate(input: MapMarkerGroupingInput, vs: any, vsFieldsInfo: IVirtualSourceFieldsInfo): void {
            if (isEmpty(this.aggregate)) {
                return;
            }
            if (input.dateRange) {
                this._updateMatchAggregatePipeline(input, vs);
            }

            if (input.grouping) {
                this._updateGroupingPipeline(input, vsFieldsInfo);
            }

            const projectStage: IMapMarkerAggregate = findStage(this.aggregate, '$project');
            if (projectStage && projectStage.$project) {
                const project: IObject = this._getProjectPipeline(vsFieldsInfo);

                if (project && !isEmpty(project.$project)) {
                    Object.assign(projectStage.$project, project.$project);
                }
            }
            this._updateUnwindPipeline(input, vsFieldsInfo);
        }

        private _updateMatchAggregatePipeline(input: MapMarkerGroupingInput, vs: any): void {
            const matchStage: IMapMarkerAggregate = findStage(this.aggregate, '$match');
            const tmpdateRange: IChartDateRange = JSON.parse(input.dateRange);
            const dateRange: IDateRange = tmpdateRange.custom && tmpdateRange.custom.from ?
            { from: tmpdateRange.custom.from, to: tmpdateRange.custom.to }
            : parsePredefinedDate(tmpdateRange.predefined, this._user.get().profile.timezone);

            if (matchStage && moment(dateRange.from).isValid()) {
                matchStage.$match[vs.dateField] = {
                    $gte: dateRange.from,
                    $lt: dateRange.to
                };
            }
        }

        private _updateGroupingPipeline(input: MapMarkerGroupingInput, vsFieldsInfo: IVirtualSourceFieldsInfo): void {
            const groupStage = findStage(this.aggregate, '$group');

        // private _updateMatchAggregatePipeline(aggregate: IMapMarkerAggregate[], input: MapMarkerGroupingInput): void {
            /* if (groupStage) {
                if (!groupStage.$group._id) {
                    groupStage.$group._id = {};
                } */
        const matchStage: IMapMarkerAggregate = findStage(this.aggregate, '$match');
        const dateRange: IDateRange = parsePredefinedDate(input.dateRange, this._user.get().profile.timezone);

                let grouping: string;
                if (isEmpty(vsFieldsInfo)) {
                    grouping = lowerCaseFirst(input.grouping);
                } else {
                    grouping = vsFieldsInfo.field.path;
                }
                groupStage.$group._id['grouping'] = '$' + grouping;
            }

        private _updateUnwindPipeline(input: MapMarkerGroupingInput, vsFieldsInfo: IVirtualSourceFieldsInfo): void {
            const unwindStage = findStage(this.aggregate, '$unwind');

            if (unwindStage && unwindStage.$unwind) {
                let path = '';
                if (isEmpty(vsFieldsInfo)) {
                    if (input.grouping) {
                        path = lowerCaseFirst(input.grouping);
                    }
                } else {
                    path = vsFieldsInfo.field.type === 'Array' ? lowerCaseFirst(vsFieldsInfo.field.name) : vsFieldsInfo.field.nonDotPath;
                }

                if (!path) {
                    return;
                }

                unwindStage.$unwind = {
                    path: `$${path}`,
                    preserveNullAndEmptyArrays: true
                };
            }
        }

        private _getProjectPipeline(vsFieldsInfo: IVirtualSourceFieldsInfo) {
            if (isEmpty(vsFieldsInfo)) {
                return;
            }

            const vsAggregate = vsFieldsInfo.aggregate;
            const fieldName = vsFieldsInfo.field.type === 'Array' ?
                            vsFieldsInfo.field.name : vsFieldsInfo.field.nonDotPath;
            return getProjectOptions(fieldName, vsFieldsInfo.field.path, vsAggregate, true);
        }

        private _getDataType(field, aggregate): string {
            if (isEmpty(aggregate)) {
                return field.type;
            }

            const projectStage: IMapMarkerAggregate = findStage(aggregate, '$project');

            if (!projectStage || !projectStage.$project) {
                return field.type;
            }

            const projectPipeline = projectStage.$project;

            // i.e. '$project['referralMain']
            const projectSubDoc = projectPipeline[field.path];
            if (isEmpty(projectSubDoc) || !isObject(projectSubDoc)) {
                return field.type;
            }

            // i.e ['$arrayElemAt']
            const subDocKeys = Object.keys(projectSubDoc);

            const isArrayType = subDocKeys.find(k => k === '$arrayElemAt');
            return isArrayType ? 'Array' : field.type;
        }

        private _noGroupingsMarkersFormatted(valuesByZip: ISaleByZip[], zipList: IZipToMapDocument[]): MapMarker[] {
            const valuesObject: Dictionary<ISaleByZip> = keyBy(valuesByZip, '_id.grouping');

            return zipList.map(zip => {
                const value = valuesObject[zip.zipCode].sales;
                if (value >= SalesColorMap[MarkerColorEnum.Yellow].min) {
                    return {
                        name: zip.zipCode,
                        lat: zip.lat,
                        lng: zip.lng,
                        color: getMarkerColor(valuesObject[zip.zipCode].sales),
                        value: value,
                        groupingName: valuesObject[zip.zipCode]._id['grouping']
                    };
                }
            });
        }

        private _groupingMarkersFormatted(salesByZip: ISaleByZip[], zipList: IZipToMapDocument[], groupByField?: string): MapMarker[] {
            if (isEmpty(salesByZip)) {
                return [];
            }
            const zipCodes: Dictionary<IZipToMapDocument> = keyBy(zipList, 'zipCode');

            return chain(salesByZip)
                        .groupBy('_id.grouping')
                        // key = zipCode => i.e. 37703
                        .map((value: any[], key: string) => {
                            let itemList: MapMarkerItemList[] = [];
                            let total: number = 0;

                            for (let i = 0; i < value.length; i++) {
                                if (value[i]) {
                                    const groupName: string = this._getGroupName(value, i, groupByField);
                                    const amount: number = value[i].values;

                                    total += amount;

                                    if (amount >= SalesColorMap[MarkerColorEnum.Yellow].min) {
                                        itemList.push({
                                            amount: amount, // 50000
                                            groupName: groupName // i.e. Knoxville
                                        });
                                    }
                                }
                            }

                            const canReturnMapMarker: boolean = this._canReturnMapMarker(key, zipCodes, total);
                            if (canReturnMapMarker) {
                                return {
                                    name: key,
                                    lat: zipCodes[key].lat,
                                    lng: zipCodes[key].lng,
                                    color: getMarkerColor(total),
                                    value: total,
                                    itemList: itemList
                                };
                            }
                        })
                        .filter(items => {
                            return !isEmpty(items);
                        })
                        .value();
        }

        // check if not empty for key, zipCodes[key], and total is greater than 0.01
        // in order to return object whose type is MapMarker
        private _canReturnMapMarker(key: string, zipCodes: Dictionary<IZipToMapDocument>, total: number): boolean {
            return key && zipCodes[key] && this._isTotalGreaterThanMininumValue(total);
        }

        // check if total is greater than 0.01
        private _isTotalGreaterThanMininumValue(total: number): boolean {
            return total > SalesColorMap[MarkerColorEnum.Yellow].min;
        }

        private _getGroupName(value: ISaleByZip[], index: number, groupByField?: string): string {
            const item: ISaleByZipGrouping = value[index]._id;
            let grouping: string;

            // return 'Uncategorized*' if have no grouping value (i.e. Knoxville)
            if (isEmpty(item) || isEmpty(item.grouping)) {
                return NULL_CATEGORY_REPLACEMENT;
            }

            grouping = item.grouping;

            // return grouping if groupByField not pass in parameter
            if (isEmpty(groupByField)) {
                return grouping;
            }

            // specific cases for referral.name, get category without comments
            if (this._canGetGroupByFieldSplitValue(groupByField, grouping)) {
                const splitReg: RegExp = /\:/;
                grouping = grouping.split(splitReg)[0];
            }

            return grouping;
        }

        // check if can split grouping by colon(:), to get value from first position
        // grouping.split
        private _canGetGroupByFieldSplitValue(groupByField: string, grouping: string): boolean {
            const reg: RegExp = /\./;
            const referralMain: string = 'referralMain';

            return referralMain === groupByField &&
                reg.test(groupByField) && isString(grouping);
        }
    }

    export enum MarkerColorEnum {
        Black = 'black',
        Purple = 'purple',
        Red = 'red',
        Blue = 'blue',
        Green = 'green',
        Yellow = 'yellow',
        Navy = 'navy',
        LightBlue = 'lightblue',
        Pink = 'pink',
        DarkBlue = 'darkblue'
    }

    export const SalesColorMap = {
        yellow: { min: 0.01, max: 5000 },
        lightblue: { min: 5001, max: 25000 },
        pink: { min: 25001, max: 50000 },
        green: { min: 50001, max: 250000 },
        darkblue: { min: 250001, max: 500000 },
        red: { min: 500001, max: 1000000 },
        purple: { min: 1000001, max: 5000000 },
        black: { min: 5000001, max: 5000000000 }
    };


    function getMarkerColor(values: number): MarkerColorEnum {
        const colors = Object.keys(SalesColorMap);
        return colors.find(c => values >= SalesColorMap[c].min && values <= SalesColorMap[c].max) as MarkerColorEnum;
    }