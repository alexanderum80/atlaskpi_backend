import { NULL_CATEGORY_REPLACEMENT } from '../../charts/queries/charts/ui-chart-base';
import {EnumChartTop, IChartTop, chartTopValue, chartTopMomentFormat} from '../../../domain/common/top-n-record';
import * as Promise from 'bluebird';
import { camelCase } from 'change-case';
import {
    cloneDeep, find, groupBy, reduce, isArray, isDate, isNull,
    isObject, isNumber, negate, pick, remove, sortBy, flatten
} from 'lodash';
import * as logger from 'winston';
import * as moment from 'moment';

import { IKPI } from '../../../domain/app/kpis/kpi';
import { IChartDateRange, IDateRange } from '../../../domain/common/date-range';
import { FrequencyEnum } from '../../../domain/common/frequency-enum';
import { field } from '../../../framework/decorators/field.decorator';
import { isArrayObject, isRegExp } from '../../../helpers/express.helpers';
import { AggregateStage } from './aggregate';

export interface ICollection {
    modelName: string;
    timestampField: string;
}

export interface IKPIMetadata {
    name?: string;
    code?: string;
    dateRange: IDateRange;
    frequency: FrequencyEnum;
}

export interface IKPIResult {
    data: any[];
    metadata?: IKPIMetadata;
}

export interface IGetDataOptions {
    dateRange?: [IChartDateRange];
    top?: IChartTop;
    includeTopGroupingValues?: string[];
    limit?: number;
    filter?: any;
    frequency?: FrequencyEnum;
    groupings?: string[];
    stackName?: string;
    isDrillDown?: boolean;
    isFutureTarget?: boolean;
    comparison?: string[];
}

export interface IKpiBase {
    getData(dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any>;
    getTargetData?(dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any>;
    getSeries?(dateRange: IDateRange, frequency: FrequencyEnum);
}

export class KpiBase {
    frequency: FrequencyEnum;
    protected kpi: IKPI;
    protected collection: ICollection;
    protected pristineAggregate: AggregateStage[];

    constructor(public model: any, public aggregate: AggregateStage[]) {
        // for multimple executeQuery iterations in the same instance we need to preserve the aggregate
        this.pristineAggregate = cloneDeep(aggregate);
    }

    executeQuery(dateField: string, dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any> {
        // for multimple executeQuery iterations in the same instance we need to preserve the aggregate
        this.aggregate = cloneDeep(this.pristineAggregate);

        logger.debug('executing query: ' + this.constructor.name);

        if (!this.model) throw 'A model is required to execute kpi query';
        if (!dateField) throw 'A date field is required to execute kpi query';

        let that = this;

        return new Promise<any>((resolve, reject) => {
            if (dateRange && dateRange.hasOwnProperty('length') && dateRange.length)
                that._injectDataRange(dateRange, dateField);
            if (options.filter)
                that._injectFilter(options.filter);
            if (options.stackName)
                that._injectTargetStackFilter(options.groupings, options.stackName);
            if (options.frequency >= 0)
                that._injectFrequency(options.frequency, dateField);
            if (options.groupings)
                that._injectGroupings(options.groupings);
            if (options.groupings && options.limit)
                that._injectSort();
            if (options.limit)
                that._injectLimit(options.limit, options.groupings);

            // decompose aggregate object into array
            let aggregateParameters = [];

            that.aggregate.forEach(stageOperator => {
                let operator = this._getAggregateOperator(stageOperator);
                aggregateParameters.push(operator);
            });

            // logger.debug('With aggregate: ' + JSON.stringify(aggregateParameters));
            this.model.aggregate(...aggregateParameters).then(data => {
                logger.debug('MongoDB data received: ' + that.model.modelName);
                // before returning I need to check if a "top" filter was added
                // if (options.filter && options.filter.top) {
                //     data = that._applyTopWithOutGroupings(data, options.filter.top);
                // }

                if (options.top && (options.top.predefined || options.top.custom)) {
                    if (options.groupings && options.includeTopGroupingValues) {
                        data = that._applyTopWithGroupings(data, options.groupings, options.includeTopGroupingValues);
                    } else {
                        if ((!options.groupings || !options.groupings.length) && options.frequency) {
                            data = that._applyTopWithOutGroupings(data, options.frequency, options.top);
                        }
                    }
                }


                resolve(data);
            }, (e) => {
                reject(e);
            });
        });
    }

    protected findStage(booleanField: string, stageOperator: string): AggregateStage {
        return this.aggregate.find(s => s[booleanField] === true && s[stageOperator] !== undefined);
    }

    protected findStages(stageOperator: string): AggregateStage[] {
        return this.aggregate.filter(s => s[stageOperator] !== undefined);
    }

    private _getAggregateOperator(stage: AggregateStage) {
        let operator: any;
        let operators = [
            '$match', '$project', '$group', '$sort', '$redact', '$limit', '$skip', '$unwind', '$sample',
            '$geoNear', '$lookup', '$out', '$sortByCount', '$addFields', '$count'];

        Object.keys(stage).forEach(k => {
            if ((operators.indexOf(k) !== -1)) {
                operator = {};
                operator[k] = stage[k];
            }
        });

        return operator;
    }

    private _injectDataRange(dateRange: IDateRange[], field: string) {
        let matchStage = this.findStage('filter', '$match');

        if (!matchStage) {
            throw 'KpiBase#_injectDataRange: Cannot inject date range because a dateRange/$match stage could not be found';
        }

        if (dateRange && dateRange.length) {
            if (dateRange.length === 1) {
                matchStage.$match[field] = { '$gte': dateRange[0].from, '$lt': dateRange[0].to };
            } else {
                if (!matchStage['$match']) {
                    matchStage.$match = {};
                }

                if (!matchStage.$match['$or']) {
                    matchStage.$match.$or = {};
                }

                matchStage.$match.$or = dateRange.map((dateParams: IDateRange) => ({
                    // field => i.e. 'product.from', timestamp
                    [field]: {
                        $gte: dateParams.from,
                        $lt: dateParams.to
                    }
                }));
            }
        }
    }

    private _injectFilter(filter: any) {
        let matchStage = this.findStage('filter', '$match');
        let cleanFilter = this._cleanFilter(filter);

        if (!matchStage) {
            throw 'KpiBase#_injectDataRange: Cannot inject filter because a dateRange/$match stage could not be found';
        }

        Object.keys(cleanFilter).forEach(filterKey => {
            // do not add top to the filter, that gets applied in the end
            if (filterKey === 'top') return;
            matchStage.$match[filterKey] = cleanFilter[filterKey];
        });
    }

    private _injectTargetStackFilter(field: any, stackName: any) {
        let matchStage = this.findStage('filter', '$match');
        if (!matchStage) {
            throw 'KpiBase#_injectDataRange: Cannot inject filter because a dateRange/$match stage could not be found';
        }

        if (field && stackName) {
            if (stackName === NULL_CATEGORY_REPLACEMENT) {
                matchStage.$match[field[0]] = null;
            } else {
                matchStage.$match[field[0]] = stackName;
            }
        }
    }

    private replacementString = [
        { key: '__dot__', value: '.' },
        { key: '__dollar__', value: '$' }
    ];

    protected _cleanFilter(filter: any): any {
        let newFilter = {};

        Object.keys(filter).forEach(filterKey => {

            let key = filterKey;
            this.replacementString.forEach(r => key = key.replace(r.key, r.value));
            let value = filter[filterKey];

            if (!isArray(value) && !isDate(value) && isObject(value)) {
                newFilter[key] = this._cleanFilter(value);
            } else if (!isDate(value) && isArrayObject(value)) {
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

    private _isRegExpOperator(operator: string): boolean {
        const regexStrings = ['startWith', 'endWith', 'contains', 'regex'];

        return regexStrings.indexOf(operator) !== -1;
    }

    private _injectFrequency(frequency: FrequencyEnum, field: string) {
        // console.log(typeof frequency);
        if (frequency < 0) return;

        field = '$' + field;

        let groupStage = this.findStage('frequency', '$group');

        if (!groupStage) {
            this.aggregate.push({ $group: { _id: {} } });
            groupStage = this.findStage('frequency', '$group');
        }

        if (!groupStage.$group._id) {
            groupStage.$group._id = { };
        }

        let currentGrouping: any;
        let projectStage = this.findStage('frequency', '$project');

        if (!projectStage) throw 'An aggregate needs a project operator defined for a frequency';

        switch (frequency) {

            case FrequencyEnum.Daily:
                if (!projectStage.$project) projectStage.$project = { };

                // add to the projection the frequency field with year, month and day: YYYY-MM-DD
                projectStage.$project.frequency = {
                    $concat: [
                        { $substr: [ { $year: field }, 0, 4 ] },
                        '-',
                        { $cond: [
                            { $lte: [ { $month: field }, 9 ] },
                            { $concat: [
                                '0', { $substr: [ { $month: field }, 0, 2 ] }
                            ]},
                            { $substr: [ { $month: field }, 0, 2 ] }
                        ]},
                        '-',
                        { $cond: [
                            { $lte: [ { $dayOfMonth: field }, 9 ] },
                            { $concat: [
                                '0', { $substr: [ { $dayOfMonth: field }, 0, 2 ] }
                            ]},
                            { $substr: [ { $dayOfMonth: field }, 0, 2 ] }
                        ]}
                    ]
                };

                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: '$frequency' };
                break;

            case FrequencyEnum.Weekly:
                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: { $week: field } };
                break;
            case FrequencyEnum.Monthly:
                if (!projectStage.$project) projectStage.$project = { };

                // add to the projection the frequency field with year and month: YYYY-MM
                projectStage.$project.frequency = {
                    $concat: [
                        { $substr: [ { $year: field }, 0, 4 ] },
                        '-',
                        { $cond: [
                            { $lte: [ { $month: field }, 9 ] },
                            { $concat: [
                                '0', { $substr: [ { $month: field }, 0, 2 ] }
                            ]},
                            { $substr: [ { $month: field }, 0, 2 ] }
                        ]}
                    ]
                };

                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: '$frequency' };
                break;
            case FrequencyEnum.Quartely:
                // I need to add a projection if it does not exist
                if (!projectStage.$project) projectStage.$project = {};

                projectStage.$project.frequency = {
                    $concat: [
                        { $substr: [ { $year: field }, 0, 4 ] },
                        '-',
                        { $cond: [
                            { $lte: [{ $month: field }, 3] },
                                'Q1',
                                { $cond: [
                                    { $lte: [{ $month: field }, 6] },
                                        'Q2',
                                        { $cond: [
                                            { $lte: [{ $month: field }, 9] },
                                            'Q3',
                                            'Q4'
                                        ] }
                                ] }
                        ] }
                    ]
                };

                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: '$frequency' };
                break;
            case FrequencyEnum.Yearly:
                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: { $year: field } };
                break;
        }

        let that = this;

        // restore the rest of the grouping if there is anything to restore
        if (!currentGrouping) return;

        Object.keys(currentGrouping).forEach(prop => {
            groupStage.$group._id[prop] = currentGrouping[prop];
        });
    }

    private _injectGroupings(groupings: string[]) {
        let projectStage = this.findStage('frequency', '$project');
        let groupStage = this.findStage('frequency', '$group');

        // if grouping is present also add it
        this._includeGroupingsInProjection(projectStage.$project, groupings);
        this._applyGroupings(groupStage.$group, groupings);
    }

    private _includeGroupingsInProjection(projection: any, groupings: string[]) {
        if (!groupings) {
            return;
        }

        groupings.forEach(g => {
            let groupingTokens = g.split('.');
            let index = Object.keys(projection).findIndex(prop => prop === groupingTokens[0]);

            if (index === -1) {
                projection[groupingTokens[0]] = 1;
            }
        });
    }

    /**
     * add $limit to aggregate for: i.e. top 5, top 10
     * @param limit
     */
    private _injectLimit(limit: number, groupings: string[]): void {
        if (!isNumber(limit) || (limit === 0)) {
            return;
        }

        // i.e. top 5 = top 4 and others
        if (limit !== 1 && (groupings || groupings.length)) {
            limit = limit - 1;
        }

        const aggregateLimit = {
            $limit: limit
        };

        this.aggregate.push(aggregateLimit);
    }

    /**
     * use for top n
     * sort highest to lowest values
     */
    private _injectSort(): void {
        let limitStage = this.findStage('topN', '$sort');

        if (limitStage && limitStage.$sort) {
            limitStage.$sort = {
                value: -1
            };
        }
    }

    private _applyGroupings(group: any, groupings: string[]) {
        if (!groupings) {
            return;
        }

        groupings.forEach(g => {
            let groupingTokens = g.split('.');
            let index = Object.keys(group._id).findIndex(prop => prop === groupingTokens[0]);

            if (index === -1) {
                group._id[camelCase(g)] = '$' + g;
            }
        });
    }

    private _applyTopWithGroupings(data: any[], groupings: string[], includeTopGroupingValues: string[]): any[] {
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

    private _reduceOthersAndTop(groupedData: any, includeTopGroupingValues: string[]): any[] {
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

    private _reformatTopAndOthers(groupedData: any): any[] {
        const structuredData = [];
        // restructure the data back to its original format
        for (let k in groupedData) {
            structuredData.push(groupedData[k]);
        }
        // convert to single arrary of objects
        return flatten(structuredData);
    }

    private _applyTopWithOutGroupings(data: any[], frequency: number, top: IChartTop): any[] {
        // validate if data array has elements
        if (!data || data.length === 0) {
            return data;
        }
        if (!top || (!top.predefined && !top.custom)) {
            return data;
        }

        const topValue: number = chartTopValue(top);
        const sortByValue: any[] = sortBy(data, 'value');

        const topNData: any[] = sortByValue.slice(0, topValue);
        const that = this;

        data = topNData.sort((a: any, b: any) => {
            const momentFormat = chartTopMomentFormat(frequency);
            return moment(a, momentFormat).diff(moment(b, momentFormat));
        });

        return data;
    }

    private _regexPattern(type: string, value: string) {
        let expression = null;
        const reg_expression = {
            'startWith': {
                searchValue: '^' + value,
            },
            'endWith': {
                searchValue: value + '$',
            },
            'contains': {
                searchValue: value,
            },
            'regex': {
                searchValue: /\/(.*)\/(.*)/.exec(value)
            }
        };
        expression = reg_expression[type];

        if (type === 'regex') {
            return new RegExp(expression.searchValue[1], expression.searchValue[2]);
        }
        return new RegExp(expression.searchValue, 'i');
    }

}