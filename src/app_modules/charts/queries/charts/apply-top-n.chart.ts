import { dataSortDesc } from '../../../../helpers/number.helpers';
import {
    groupBy, reduce, pick, flatten,
    sortBy, intersectionWith, isEqual, isEmpty,
    every
} from 'lodash';
import { camelCase } from 'change-case';
import { NULL_CATEGORY_REPLACEMENT } from './ui-chart-base';
import * as moment from 'moment';

import {chartTopMomentFormat, chartTopLimit, IChartTop, isNestedArray} from '../../../../domain/common/top-n-record';
import {IGetDataOptions} from '../../../kpis/queries/kpi-base';

export class ApplyTopNChart {

    static applyTopNToData(data: any[], options: IGetDataOptions) {
        if (options.top && (options.top.predefined || options.top.custom)) {
            if (options.groupings && options.includeTopGroupingValues) {
                data = this._applyTopWithGroupings(data, options.groupings, options.includeTopGroupingValues);
            } else {
                if ((!options.groupings || !options.groupings.length) && options.frequency) {
                    data = this._applyTopWithOutGroupings(data, options.frequency, options.top);
                }
            }
        }

        return data;
    }

    private static _applyTopWithGroupings(data: any[], groupings: string[], includeTopGroupingValues: (string|string[])[]): any[] {
        if (!data || !data.length) { return data; }
        if (!groupings || !groupings.length) { return data; }
        if (!includeTopGroupingValues || !includeTopGroupingValues.length) { return data; }

        /**
         * if not in top n, group by 'Others'
         * else return same object
         */
        const groupedData = groupBy(data, (item) => {
            const groupField: string = camelCase(groupings[0]);

            // assign NULL_CATEGORY_REPLACEMENT if object does not contain grouping field
            if (!item._id[groupField]) {
                item._id[groupField] = isNestedArray(includeTopGroupingValues) ?
                                       [NULL_CATEGORY_REPLACEMENT] : NULL_CATEGORY_REPLACEMENT;
            }

            // check if the grouping value exist in the top n
            const notTopN = this._isNotInTopN(item, groupField, includeTopGroupingValues);

            if (notTopN) {
                item._id[groupField] = 'Others';
                // i.e. Others-2018-01
                return `${item._id[groupField]}-${item._id.frequency}`;
            }

            return `${item._id[groupField]}`;
        });

        data = this._reduceOthersAndTopN(groupedData, includeTopGroupingValues);

        return data;
    }

    /**
     * includeTopGroupingValues: i.e. (return value) "procedure", ["procedure"], ["procedure", "reason"]
     * @param item
     * @param groupField
     * @param includeTopGroupingValues
     */
    private static _isNotInTopN(item: any, groupField: string, includeTopGroupingValues: (string|string[])[]): boolean {
        if (isEmpty(item)) {
            return false;
        }

        // i.e. (return value) null, ['procedure','reason'], ['procedure']
        const itemGroupByField = item._id[groupField];
        let isNotTopN: boolean;

        if (item._id) {
            if (Array.isArray(itemGroupByField)) {
                const notInTopGroupings = includeTopGroupingValues.find((groupingValues: string|string[]) => {
                        const intersect: any[] = intersectionWith(groupingValues, itemGroupByField, isEqual);
                        // i.e. ['procedure','reason'], ['procedure']
                        // example above will intersect, but not have same length
                        return intersect.length > 0 && (groupingValues.length === itemGroupByField.length);
                });

                isNotTopN = notInTopGroupings === undefined;
            } else {
                isNotTopN = includeTopGroupingValues.indexOf(item._id[groupField]) === -1;
            }
        } else {
            isNotTopN = false;
        }

        return isNotTopN;
    }

    private static _reduceOthersAndTopN(groupedData: any, includeTopGroupingValues: (string|string[])[]): any[] {
        for (let i in groupedData) {
            let notExistInTopN;

            if (isNestedArray(includeTopGroupingValues)) {
                notExistInTopN = includeTopGroupingValues.find((g: string[]) => g.join(',') !== i);
            } else {
                notExistInTopN = includeTopGroupingValues.indexOf(i) === -1;
            }

            if (notExistInTopN) {
                // get the total of 'Other' grouping
                const othersTotal = reduce(groupedData[i], (result: any, item: any) => {
                    return {
                        value: result.value + item.value
                    };
                });

                // get _id object
                const { _id } = pick(groupedData[i][0], '_id');
                // show the _id object with the total by frequency of 'Others'
                groupedData[i] = [{
                    _id,
                    value: othersTotal.value
                }];
            }
        }

        return this._reformatTopAndOthers(groupedData);
    }

    private static _reformatTopAndOthers(groupedData: any): any[] {
        const structuredData = [];
        // restructure the data back to its original format
        for (let k in groupedData) {
            structuredData.push(groupedData[k]);
        }
        // convert to single arrary of objects
        return flatten(structuredData);
    }

    private static _applyTopWithOutGroupings(data: any[], frequency: number, top: IChartTop): any[] {
        // validate if data array has elements
        if (!data || data.length === 0) {
            return data;
        }
        if (!top || (!top.predefined && !top.custom)) {
            return data;
        }

        const topValue: number = chartTopLimit(top);
        const sortByValue: any[] = data.sort(dataSortDesc);

        const topNData: any[] = sortByValue.slice(0, topValue);
        const that = this;

        data = topNData.sort((a: any, b: any) => {
            const momentFormat = chartTopMomentFormat(frequency);
            return moment(a, momentFormat).diff(moment(b, momentFormat));
        });

        return data;
    }
}