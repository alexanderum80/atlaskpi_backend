import { IDateRange, parsePredefinedDateOld } from '../domain/common/date-range';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { injectable, inject } from 'inversify';
import { chain, Dictionary, isEmpty, keyBy, isString, isObject, filter, sortBy } from 'lodash';
import {Sales} from '../domain/app/sales/sale.model';
import {ZipsToMap} from '../domain/master/zip-to-map/zip-to-map.model';
import {ISaleByZip, ISaleByZipGrouping, TypeMap} from '../domain/app/sales/sale';
import {NULL_CATEGORY_REPLACEMENT} from '../app_modules/charts/queries/charts/ui-chart-base';
import {MapMarkerItemList, MapMarker, MapMarkerGroupingInput} from '../app_modules/maps/map.types';
import {IZipToMapDocument} from '../domain/master/zip-to-map/zip-to-map';
import { IFieldMetadata, IVirtualSourceDocument, IVirtualSourceFields } from '../domain/app/virtual-sources/virtual-source';
import {IObject} from '../app_modules/shared/criteria.plugin';
import {KPIFilterHelper} from '../domain/app/kpis/kpi-filter.helper';
import * as moment from 'moment';
import {getProjectOptions, findStage, sortByProject} from '../domain/common/fields-with-data';
import { lowerCaseFirst } from 'change-case';

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
        @inject(Sales.name) private _sales: Sales,
        @inject(ZipsToMap.name) private _ZipToMaps: ZipsToMap,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources) { }


    async getMapMarkers(dataTypeMap: TypeMap, input: MapMarkerGroupingInput): Promise<IMapMarker[]> {
        try {
            // i.e. input.grouping = 'Referral'
            const aggregate: IMapMarkerAggregate[] = await this._getAggregateObject(dataTypeMap, input);

            if (isEmpty(aggregate)) {
                return [];
            }

            const salesByZip = await this._sales.model.salesBy(aggregate);
            // get the zip codes related
            const zipList = await this._ZipToMaps.model.find({
                                zipCode: {
                                    $in: salesByZip.map(d => d._id.customerZip)
                                }});

            // convert array to object
            let markers;

            if (input) {
                const groupByField = input['grouping'];
                if (groupByField) {
                    markers = this._groupingMarkersFormatted(salesByZip, zipList, groupByField);
                } else {
                    markers = this._noGroupingsMarkersFormatted(salesByZip, zipList);
                }
            } else {
                markers = this._noGroupingsMarkersFormatted(salesByZip, zipList);
            }

            return markers;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    private async _getAggregateObject(type: TypeMap, input: MapMarkerGroupingInput): Promise<any[]> {
        try {
            let aggregate: IMapMarkerAggregate[] = [];
            switch (type) {
                case TypeMap.customerAndZip:
                    aggregate.push(
                        { '$match': { 'product.amount': { '$gte': 0 } }},
                        { '$project': { product: 1, _id: 0, customer: 1 }},
                        { '$unwind': {} },
                        { '$group': {
                            _id: { customerZip: '$customer.zip' },
                            sales: { '$sum': '$product.amount' }
                        }}
                    );

                    if (input && isObject(input)) {
                        const vs = await this._virtualSources.model.findOne({
                            name: REVENUE_BY_REFERRALS,
                        });

                        const vsFieldsInfo: IVirtualSourceFieldsInfo = this._vsFieldsInfo(vs, input.grouping);
                        this._updateAggregate(aggregate, input, vsFieldsInfo);

                        if (this._sortByUnwind(aggregate, vsFieldsInfo)) {
                            aggregate = this._getSortedAggregate(aggregate);
                        }
                    }

                    aggregate = this._filterEmptyUnwindPipe(aggregate);
                case TypeMap.productAndZip:
                    break;
            }
            return aggregate;
        } catch (err) {
            console.error(err);
            throw new Error('error getting aggregate object');
        }
    }

    private _sortByUnwind(aggregate, vsFieldsInfo: IVirtualSourceFieldsInfo): boolean {
        const projectStage = findStage(aggregate, '$project');
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

    private _getSortedAggregate(aggregate: IMapMarkerAggregate[]): IMapMarkerAggregate[] {
        let agg: IMapMarkerAggregate[] = sortBy(aggregate, '$project');
        const unwindStage: IMapMarkerAggregate = findStage(aggregate, '$unwind');

        agg = agg.filter(a => !a.$unwind);
        agg.unshift(unwindStage);

        return agg;
    }

    private _filterEmptyUnwindPipe(aggregate: any[]): any[] {
        const unwindStage: IMapMarkerAggregate = findStage(aggregate, '$unwind');

        if (isEmpty(unwindStage.$unwind)) {
            delete unwindStage.$unwind;
        }

        return filter(aggregate, (agg) => !isEmpty(agg));
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

    private _updateAggregate(aggregate: IMapMarkerAggregate[], input: MapMarkerGroupingInput, vsFieldsInfo: IVirtualSourceFieldsInfo): void {
        if (isEmpty(aggregate)) {
            return;
        }
        if (input.dateRange) {
            this._updateMatchAggregatePipeline(aggregate, input);
        }

        if (input.grouping) {
            this._updateGroupingPipeline(aggregate, input, vsFieldsInfo);
        }

        const projectStage: IMapMarkerAggregate = findStage(aggregate, '$project');
        if (projectStage && projectStage.$project) {
            const project: IObject = this._getProjectPipeline(aggregate, input, vsFieldsInfo);

            if (project && !isEmpty(project.$project)) {
                Object.assign(projectStage.$project, project.$project);
            }
        }

        this._updateUnwindPipeline(aggregate, input, vsFieldsInfo);
    }

    private _updateMatchAggregatePipeline(aggregate: IMapMarkerAggregate[], input: MapMarkerGroupingInput): void {
        const matchStage: IMapMarkerAggregate = findStage(aggregate, '$match');
        const dateRange: IDateRange = parsePredefinedDateOld(input.dateRange);

        if (matchStage && moment(dateRange.from).isValid()) {
            matchStage.$match['product.from'] = {
                $gte: dateRange.from,
                $lt: dateRange.to
            };
        }
    }

    private _updateGroupingPipeline(aggregate: IMapMarkerAggregate[], input: MapMarkerGroupingInput, vsFieldsInfo: IVirtualSourceFieldsInfo): void {
        const groupStage = findStage(aggregate, '$group');

        if (groupStage) {
            if (!groupStage.$group._id) {
                groupStage.$group._id = {};
            }

            let grouping: string;
            if (isEmpty(vsFieldsInfo)) {
                grouping = lowerCaseFirst(input.grouping);
            } else {
                grouping = vsFieldsInfo.field.path;
            }
            groupStage.$group._id['grouping'] = '$' + grouping;
        }
    }

    private _updateUnwindPipeline(aggregate: IMapMarkerAggregate[], input: MapMarkerGroupingInput, vsFieldsInfo: IVirtualSourceFieldsInfo): void {
        const unwindStage = findStage(aggregate, '$unwind');

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

    private _getProjectPipeline(aggregate: IMapMarkerAggregate[], input: MapMarkerGroupingInput, vsFieldsInfo: IVirtualSourceFieldsInfo) {
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

    private _noGroupingsMarkersFormatted(salesByZip: ISaleByZip[], zipList: IZipToMapDocument[]): MapMarker[] {
        const salesObject: Dictionary<ISaleByZip> = keyBy(salesByZip, '_id.customerZip');

        return zipList.map(zip => {
            const value = salesObject[zip.zipCode].sales;
            if (value >= SalesColorMap[MarkerColorEnum.Yellow].min) {
                return {
                    name: zip.zipCode,
                    lat: zip.lat,
                    lng: zip.lng,
                    color: getMarkerColor(salesObject[zip.zipCode].sales),
                    value: value,
                    groupingName: salesObject[zip.zipCode]._id['grouping']
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
                    .groupBy('_id.customerZip')
                    // key = zipCode => i.e. 37703
                    .map((value: ISaleByZip[], key: string) => {
                        let itemList: MapMarkerItemList[] = [];
                        let total: number = 0;

                        for (let i = 0; i < value.length; i++) {
                            if (value[i]) {
                                const groupName: string = this._getGroupName(value, i, groupByField);
                                const amount: number = value[i].sales;

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


function getMarkerColor(sales: number): MarkerColorEnum {
    const colors = Object.keys(SalesColorMap);
    return colors.find(c => sales >= SalesColorMap[c].min && sales <= SalesColorMap[c].max) as MarkerColorEnum;
}