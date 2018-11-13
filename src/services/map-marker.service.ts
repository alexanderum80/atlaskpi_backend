import { name } from 'aws-sdk/clients/importexport';
import { IDateRange, parsePredefinedDate, processDateRangeWithTimezone } from '../domain/common/date-range';
import { CurrentUser } from '../domain/app/current-user';
import { injectable, inject } from 'inversify';
import { chain, Dictionary, isEmpty, keyBy, isString,
         isObject, isArray, isDate, clone, remove } from 'lodash';
import {ZipsToMap} from '../domain/master/zip-to-map/zip-to-map.model';
import {ISaleByZip, ISaleByZipGrouping, TypeMap} from '../domain/app/sales/sale';
import {NULL_CATEGORY_REPLACEMENT} from '../app_modules/charts/queries/charts/ui-chart-base';
import {MapMarkerItemList, MapMarker, MapMarkerGroupingInput} from '../app_modules/maps/map.types';
import {IZipToMapDocument} from '../domain/master/zip-to-map/zip-to-map';
import * as moment from 'moment';
import { camelCase } from 'change-case';
import { Maps } from '../domain/app/maps/maps.model';
import { KPIs } from '../domain/app/kpis/kpi.model';
import { IKPIDocument } from '../domain/app/kpis/kpi';
import { KpiFactory } from '../app_modules/kpis/queries/kpi.factory';
import * as jsep from 'jsep';
import * as math from 'mathjs';
import { IChartMetadata } from '../app_modules/charts/queries/charts/chart-metadata';

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

export const ExpressionTreeTypes = {
    binary: 'BinaryExpression',
    identifier: 'Identifier',
    literal: 'Literal',
    CallExpression: 'CallExpression'
};

@injectable()
export class MapMarkerService {

    constructor(
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(KpiFactory.name)private _kpiFactory: KpiFactory,
        @inject(Maps.name) private _maps: Maps,
        @inject(ZipsToMap.name) private _ZipToMaps: ZipsToMap,
        @inject(CurrentUser.name) private _user: CurrentUser
        ) { }

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

        private _mergeList(leftList, operator, rightList) {
            const that = this;
            let result = [];

            // check if leftList/rightList is null or undefined
            if (!leftList || !rightList) {
                return;
            }

            // check if leftList and rightList has empty array
            if (!leftList.length && !rightList.length) {
                return;
            }

            // get the keys for the first element
            const keysToTest: any[] = leftList.length ?
                Object.keys(leftList[0]._id) :
                (
                    rightList.length ?
                    Object.keys(rightList[0]._id) :
                    []
                );

            // start on the left collection
            (<Array<any>>leftList).forEach(l => {
                const rightSide = that._popWithSameGroupings(rightList, l, keysToTest);
                const rightValue = rightSide.length > 0 ? rightSide[0].value : 0;
                let newDataItem = clone(l);

                newDataItem.value = that._doCalculation(l.value, operator, rightValue);
                result.push(newDataItem);
            });
            // now continue with whatever is left on the right cloned collection
            (<Array<any>>rightList).forEach(r => {
                const leftSide = that._popWithSameGroupings(leftList, r, keysToTest);
                const leftValue = leftSide.length > 0 ? leftSide[0].value : 0;
                let newDataItem = clone(r);

                newDataItem.value = that._doCalculation(leftValue, operator, r.value);
                result.push(newDataItem);
            });

            return result;
        }

        private _popWithSameGroupings(collection: any[], ele: any, keys: string[]) {
            return remove(collection, (e) => {
                let found = true;
                // build the comparison object with all the jeys for this object
                keys.forEach(key => {
                    // if at least one value is different then I can finish the comparison here
                    if (e._id[key] !== ele._id[key]) {
                        found = false;
                        return;
                    }
                });

                return found;
            });
        }

        private _doCalculation(left, operator, right) {
            return math.eval(`${left || 0} ${operator} ${right || 0}`);
        }

        private _applyLiteralToList(list: any[], operator: string, value: number) {
            const that = this;
            list.forEach(item => item.value = that._doCalculation(item.value, operator, value));
            return list;
        }

        private _applyBinaryOperator(left, operator, right): any {
            // I need to make sure that both sets have the same data
            // algorhitm: Start running one collection
            const that = this;
            const leftIsArray = isArray(left);
            const rightIsArray = isArray(right);

            if (leftIsArray && rightIsArray) {
                return this._mergeList(left, operator, right);
            } else if (leftIsArray && !rightIsArray) {
                return this._applyLiteralToList(left, operator, +right);
            } else if (!leftIsArray && rightIsArray) {
                return this._applyLiteralToList(right, operator, +left);
            } else if (!leftIsArray && !rightIsArray) {
                return that._doCalculation(left, operator, right);
            }
        }

        private _processBinaryExpression(exp: jsep.IBinaryExpression, input: MapMarkerGroupingInput): Promise<any> {
            const that = this;
            // get type for operands
            const leftValue = this._processExpression(exp.left, input);
            const rightValue = this._processExpression(exp.right, input);

            return new Promise<any>((resolve, reject) => {
                Promise.all([leftValue, rightValue]).then(results => {
                    const result = that._applyBinaryOperator(results[0], exp.operator, results[1]);
                    resolve(result);
                }).catch(e => reject(e));
            });
        }

        private _processExpression(exp: jsep.IExpression, input: MapMarkerGroupingInput): Promise<any> {
            switch (exp.type) {
                case ExpressionTreeTypes.binary:
                    return this._processBinaryExpression(<jsep.IBinaryExpression>exp, input);
                case ExpressionTreeTypes.identifier:
                    return this._getKpiData((<jsep.IIdentifier>exp).name.replace('kpi', ''), input);
                case ExpressionTreeTypes.literal:
                    return Promise.resolve(+(<jsep.ILiteral>exp).value);
                case ExpressionTreeTypes.CallExpression:
                    return this._getKpiData(input.kpi, input);
            }
        }

        private getData(kpi: any, input: MapMarkerGroupingInput): any {
            const exp: jsep.IExpression = jsep(kpi.expression);
            return this._processExpression(exp, input);
        }

        async _getKpiData(kpiId: string, input: MapMarkerGroupingInput) {

            const DateRange: any[] = [];
            const allKpis: IKPIDocument[] = await this._kpis.model.find({});
            const kpiDocument: IKPIDocument = allKpis.find((k: IKPIDocument) => k.id === kpiId);
            const kpi = await this._kpiFactory.getInstance(kpiDocument);
            const inputDR = JSON.parse(input.dateRange);
            const timezone = this._user.get().profile.timezone;
            const dr = processDateRangeWithTimezone(inputDR, timezone);

            DateRange.push(dr);
            const metadata: IChartMetadata = {
                dateRange: DateRange,
                groupings: input.grouping
            };
            return await kpi.getData(DateRange, metadata);
        }

        async getMapMarkers(dataTypeMap: TypeMap, input: MapMarkerGroupingInput): Promise<IMapMarker[]> {
            try {
                if (!input.kpi || !input.grouping) { return []; }
                let dateRange;
                if (isString(input.dateRange)) {
                    dateRange = JSON.parse(input.dateRange);
                } else {
                    dateRange = input.dateRange;
                }
                if (dateRange.predefined === 'custom' && (dateRange.custom.from === '' || dateRange.custom.to === '' )) {
                    return [];
                }
                const allKpis: IKPIDocument[] = await this._kpis.model.find({});
                const kpiDocument: IKPIDocument = allKpis.find((k: IKPIDocument) => k.id === input.kpi);
                const resultByZip = await this.getData(kpiDocument, input);
                if (resultByZip === undefined) {
                    return [];
                }
                // get the zip codes related
                const zipList = await this._ZipToMaps.model.find({
                                    zipCode: {
                                        $in: <any> resultByZip.map(d => d._id.customerZip)
                                    }});
                let markers;
                const groupByField = input.grouping[input.grouping.length - 1];
                if (input) {
                    if (groupByField) {
                        markers = this._groupingMarkersFormatted(resultByZip, zipList, groupByField);
                    } else {
                        markers = this._noGroupingsMarkersFormatted(resultByZip, zipList, groupByField);
                    }
                } else {
                    markers = this._noGroupingsMarkersFormatted(resultByZip, zipList, groupByField);
                }
                return markers;
            } catch (err) {
                console.error(err);
                return [];
            }
        }

        private _noGroupingsMarkersFormatted(valuesByZip: ISaleByZip[], zipList: IZipToMapDocument[], groupByField?: string): MapMarker[] {
            const grouping = camelCase(groupByField);
            const groupBy = '_id.' + grouping;
            const valuesObject: Dictionary<ISaleByZip> = keyBy(valuesByZip, groupBy);

            return zipList.map(zip => {
                const value = valuesObject[zip.zipCode].sales;
                if (value >= SalesColorMap[MarkerColorEnum.Yellow].min) {
                    return {
                        name: zip.zipCode,
                        lat: zip.lat,
                        lng: zip.lng,
                        color: getMarkerColor(valuesObject[zip.zipCode].sales),
                        value: value,
                        groupingName: valuesObject[zip.zipCode]._id[grouping]
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
                        .map((value: any[], key: string) => {
                            let itemList: MapMarkerItemList[] = [];
                            let total: number = 0;

                            for (let i = 0; i < value.length; i++) {
                                if (value[i]) {
                                    const groupName: string = this._getGroupName(value, i, groupByField);
                                    const amount: number = value[i].value;

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
            const item = value[index]._id;
            let grouping: string;

            // return 'Uncategorized*' if have no grouping value (i.e. Knoxville)
            if (isEmpty(item) || isEmpty(item[camelCase(groupByField)])) {
                return NULL_CATEGORY_REPLACEMENT;
            }

            grouping = item[camelCase(groupByField)][0];

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