import { isArrayObject } from '../../../helpers/express.helpers';
import * as Promise from 'bluebird';
import {
    cloneDeep,
    isArray,
    isObject,
    remove,
    negate,
    isNull,
    groupBy,
    find,
    pick,
    sortBy
} from 'lodash';

import * as logger from 'winston';

import { IKPI } from '../../../domain/app/kpis/kpi';
import { IChartDateRange, IDateRange } from '../../../domain/common/date-range';
import { FrequencyEnum } from '../../../domain/common/frequency-enum';
import { field } from '../../../framework/decorators/field.decorator';
import { AggregateStage } from './aggregate';

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
    filter?: any;
    frequency?: FrequencyEnum;
    groupings?: string[];
    stackName?: any;
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
                if (options.filter && options.filter.top) {
                    data = that._applyTop(data, options.filter.top);
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
            if (operators.indexOf(k) !== -1) {
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

        if (dateRange &&
            (<any>dateRange).length) {
            if ((<any>dateRange).length === 1) {
                matchStage.$match[field] = { '$gte': dateRange[0].from, '$lte': dateRange[0].to };
            } else {
                (<any>dateRange).map((dateParams) => {
                    matchStage.$match = {
                        $or: [
                            {
                                [field]: { '$gte': dateParams.from, '$lte': dateParams.to }
                            }
                        ]
                    };
                });
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
            matchStage.$match[field[0]] = stackName;
        }
    }

    protected _cleanFilter(filter: any): any {
        let newFilter = {};
        let replacementString = [
            { key: '__dot__', value: '.' },
            { key: '__dollar__', value: '$' }
        ];

        Object.keys(filter).forEach(filterKey => {
            let newKey = filterKey;

            replacementString.forEach(replacement => {
                newKey = newKey.replace(replacement.key, replacement.value);
            });

            let value = filter[filterKey];

            if (!isArray(value) && isObject(value)) {
                value = this._cleanFilter(value);
            } else if (isArrayObject(value)) {
                for (let i = 0; i < value.length; i++) {
                    value[i] = this._cleanFilter(value[i]);
                }
            }

            newFilter[newKey] = value;
        });

        return newFilter;
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

    private _applyGroupings(group: any, groupings: string[]) {
        if (!groupings) {
            return;
        }

        groupings.forEach(g => {
            let groupingTokens = g.split('.');
            let index = Object.keys(group._id).findIndex(prop => prop === groupingTokens[0]);

            if (index === -1) {
                group._id[groupingTokens[0]] = '$' + g;
            }
        });
    }

    private _applyTop(data: any[], top: { field: string, value: number }): any[] {
        // validate if data array has elements
        if (!data || data.length === 0) {
            return data;
        }
        // get first record to extract the groupings
        let groupings = Object.keys(data[0]._id);
        // remove out of that group the filed use for the top
        remove(groupings, g => g === top.field);

        if (groupings.length === 0) {
            groupings = ['frequency'];
        }

        // now group the results and remove all values that exceed the group size
        // https://stackoverflow.com/questions/29587488/grouping-objects-by-multiple-columns-with-lodash-or-underscore
        const notNull = negate(isNull);
        const dataGroups = groupBy(data, (item) => {
            return find(pick(item._id, groupings), notNull);
        });

        let newResult: any[] = [];

        // sort / slice results
        for (let k in dataGroups) {
            let groupData = dataGroups[k];
            const sortedResult = sortBy(groupData, (item: any) => -item.value );
            const slicedList = sortedResult.slice(0, top.value);

            newResult = newResult.concat(slicedList);
        }

        return newResult;
    }

}