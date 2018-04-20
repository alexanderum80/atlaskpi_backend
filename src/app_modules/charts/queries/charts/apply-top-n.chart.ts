import { groupBy, reduce, pick, flatten, sortBy } from 'lodash';
import { camelCase } from 'change-case';
import { NULL_CATEGORY_REPLACEMENT } from './ui-chart-base';
import * as moment from 'moment';

import { chartTopMomentFormat, chartTopLimit, IChartTop } from '../../../../domain/common/top-n-record';
import { IGetDataOptions } from '../../../kpis/queries/kpi-base';

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

    private static _applyTopWithGroupings(data: any[], groupings: string[], includeTopGroupingValues: string[]): any[] {
        if (!data || !data.length) { return data; }
        if (!groupings || !groupings.length) { return data; }
        if (!includeTopGroupingValues || !includeTopGroupingValues.length) { return data; }

        /**
         * if not in top n, group by 'Others'
         * else return same object
         */
        const groupedData = groupBy(data, (item) => {
            const groupField = camelCase(groupings[0]);

            // assign NULL_CATEGORY_REPLACEMENT if object does not contain grouping field
            if (!item._id[groupField]) {
                item._id[groupField] = NULL_CATEGORY_REPLACEMENT;
            }

            // check if the grouping value exist in the top n
            const topNotExist = item._id ?
                              includeTopGroupingValues.indexOf(item._id[groupField]) === -1 :
                              false;

            if (topNotExist) {
                item._id[groupField] = 'Others';
                // i.e. Others-2018-01
                return `${item._id[groupField]}-${item._id.frequency}`;
            }

            return `${item._id[groupField]}`;
        });

        data = this._reduceOthersAndTop(groupedData, includeTopGroupingValues);

        return data;
    }

    private static _reduceOthersAndTop(groupedData: any, includeTopGroupingValues: string[]): any[] {
        for (let i in groupedData) {
            if (includeTopGroupingValues.indexOf(i) === -1) {
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
        const sortByValue: any[] = sortBy(data, 'value');

        const topNData: any[] = sortByValue.slice(0, topValue);
        const that = this;

        data = topNData.sort((a: any, b: any) => {
            const momentFormat = chartTopMomentFormat(frequency);
            return moment(a, momentFormat).diff(moment(b, momentFormat));
        });

        return data;
    }
}