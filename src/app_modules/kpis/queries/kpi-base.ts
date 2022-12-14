import { inject, injectable } from 'inversify';
import { camelCase } from 'change-case';
import { find, cloneDeep, isArray, isDate, isObject, isString, isNumber, isBoolean, merge } from 'lodash';
import * as logger from 'winston';

import { IKPI } from '../../../domain/app/kpis/kpi';
import { IChartDateRange, IDateRange } from '../../../domain/common/date-range';
import { FrequencyEnum } from '../../../domain/common/frequency-enum';
import { IChartTop } from '../../../domain/common/top-n-record';
import { NULL_CATEGORY_REPLACEMENT } from '../../charts/queries/charts/ui-chart-base';
import { AggregateStage } from './aggregate';
import { VirtualSourceAggregateService, IKeyValues, IProcessAggregateResult, AggPlaceholderTypeEnum, ObjectReplacementPattern } from '../../../domain/app/virtual-sources/vs-aggregate.service';
import { IVirtualSource, IVirtualSourceDocument, IFieldMetadata } from '../../../domain/app/virtual-sources/virtual-source';

export interface IKpiVirtualSources {
    virtualSource: IVirtualSourceDocument;
    parentVirtualSource?: IVirtualSourceDocument;
}

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
    dateRange?: IChartDateRange[];
    top?: IChartTop;
    includeTopGroupingValues?: (string|string[])[];
    limit?: number;
    filter?: any;
    frequency?: FrequencyEnum;
    groupings?: string[];
    sortingCriteria?: string;
    sortingOrder?: string;
    stackName?: string;
    isDrillDown?: boolean;
    isFutureTarget?: boolean;
    comparison?: string[];
    originalFrequency?: FrequencyEnum;
}

export interface IKpiBase {
    getData(dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any>;
    getTargetData?(dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any>;
    getSeries?(dateRange: IDateRange, frequency: FrequencyEnum);
}

@injectable()
export class KpiBase {
    frequency: FrequencyEnum;
    protected kpi: IKPI;
    protected collection: ICollection;
    protected pristineAggregate: AggregateStage[];
    protected timezone: string;

    protected _vsAggregateService: VirtualSourceAggregateService;

    constructor(public model: any, public aggregate: AggregateStage[], protected kpiVirtualSources: IKpiVirtualSources) {
        // for multimple executeQuery iterations in the same instance we need to preserve the aggregate
        if (!model) {
            console.error('no model');
        }
        this.pristineAggregate = cloneDeep(aggregate);
    }

    executeQuery(dateField: string, dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any> {
        // process the virtual source aggregate

        const vsAggregateReplacements: IKeyValues = {
            '__from__': dateRange[0].from,
            '__to__': dateRange[0].to,
            '__timezone__': this.timezone
        };

        let aggregateResult: IProcessAggregateResult = {
            aggregate: [],
            appliedReplacements: []
        };

        let dateRangeApplied = false;

        if (this.kpiVirtualSources) {
            aggregateResult = this._vsAggregateService.processReplacements(
                this.kpiVirtualSources.virtualSource, vsAggregateReplacements
            );

            this.aggregate = aggregateResult.aggregate;

            dateRangeApplied
                = aggregateResult.appliedReplacements
                                 .filter(r => r.type === AggPlaceholderTypeEnum.dateRange).length > 0;

            if (!dateRangeApplied) {
                aggregateResult = this._vsAggregateService.tryDateRangeAsFirstStage(
                    this.aggregate,
                    this.kpiVirtualSources.virtualSource,
                    this.kpiVirtualSources.parentVirtualSource,
                    dateRange[0]
                );
            }
        }

        dateRangeApplied
            = aggregateResult.appliedReplacements
                             .filter(r => r.type === AggPlaceholderTypeEnum.dateRange).length > 0;


        // for multiple executeQuery iterations in the same instance we need to preserve the aggregate
        this.aggregate = aggregateResult.aggregate.concat(cloneDeep(this.pristineAggregate));

        logger.debug('executing query: ' + this.constructor.name);

        if (!this.model) throw 'A model is required to execute kpi query';
        if (!dateField) throw 'A date field is required to execute kpi query';

        let that = this;

        return new Promise<any>((resolve, reject) => {

            if (!dateRangeApplied
                && dateRange && dateRange.length)
                that._injectDataRange(dateRange, dateField);

            if (options.filter)
                that._injectFilter(options.filter);

            if (options.stackName)
                that._injectTargetStackFilter(options.groupings, options.stackName);
            if (options.frequency >= 0)
                that._injectFrequency(options.frequency, dateField);
            if (options.groupings && options.groupings.filter(g => g !== '').length)
                that._injectGroupings(options.groupings);

            // decompose aggregate object into array
            let aggregateParameters = [];

            that.aggregate.forEach(stageOperator => {
                let operator = this._getAggregateOperator(stageOperator);
                aggregateParameters.push(operator);
            });

            // logger.debug('With aggregate: ' + JSON.stringify(aggregateParameters));
            const aggregate = this.model.aggregate(...aggregateParameters);
            aggregate.options = { allowDiskUse: true };
            aggregate.exec((err, data) => {
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
            '$geoNear', '$lookup', '$out', '$sortByCount', '$addFields', '$count', '$facet', '$replaceRoot'];

        Object.keys(stage).forEach(k => {
            if ((operators.indexOf(k) !== -1)) {
                operator = {};
                operator[k] = stage[k];
            }
        });

        return operator;
    }

    private _injectDataRange(dateRange: IDateRange[], field: string) {
        let matchDateRange = this.findStage('filter', '$match');

        if (dateRange && dateRange.length) {
            if (dateRange.length === 1) {
                matchDateRange.$match[field] = {
                    '$gte':  dateRange[0].from,
                    '$lt':   dateRange[0].to
                };
            } else {
                if (!matchDateRange['$match']) {
                    matchDateRange.$match = {};
                }

                if (!matchDateRange.$match['$or']) {
                    matchDateRange.$match.$or = {};
                }

                matchDateRange.$match.$or = dateRange.map((dateParams: IDateRange) => {
                    return {
                        // field => i.e. 'product.from', timestamp
                        [field]: {
                            '$gte':  dateParams.from,
                            '$lt':   dateParams.to,
                        }
                    };
                });
            }
        }

        // this.aggregate.unshift(matchDateRange);
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

    protected _injectFormulaFieldFilter(filter: any) {
        let matchStage = this.findStage('formulaFieldsFilter', '$match');
        let cleanFilter = this._vsAggregateService.cleanFilter(filter);

        if (!matchStage) {
            throw new Error('KpiBase#_injectFormulaFieldFilter: Cannot inject filter because a formulaFieldsFilter/$match stage could not be found');
        }

        Object.keys(cleanFilter).forEach(filterKey => {
            // do not add top to the filter, that gets applied in the end
            if (filterKey === 'top') return;
            matchStage.$match[filterKey] = cleanFilter[filterKey];
        });

        if (Object.keys(matchStage.$match).length > 0) return;

        const index = this.aggregate.indexOf(matchStage);
        if (index !== -1) this.aggregate.splice(index, 1);
    }

    private _injectTargetStackFilter(field: any, stackName: any) {
        let matchStage = this.findStage('filter', '$match');
        if (!matchStage) {
            throw 'KpiBase#_injectDataRange: Cannot inject filter because a dateRange/$match stage could not be found';
        }

        if (Array.isArray(field) && field[0] && stackName) {
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

        if (!filter || isString(filter) ||
            isNumber(filter) || isBoolean(filter) ||
            isDate(filter)) {
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

    private _isRegExpOperator(operator: string): boolean {
        const regexStrings = ['startWith', 'endWith', 'contains', 'regex'];

        return regexStrings.indexOf(operator) !== -1;
    }

    private _injectFrequency(frequency: FrequencyEnum, field: string) {
        const tz = this.timezone; // || 'Etc/Universal';

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
                        { $substr: [ { $year: { date: field, timezone: tz } }, 0, 4 ] },
                        '-',
                        { $cond: [
                            { $lte: [ { $month: { date: field, timezone: tz } }, 9 ] },
                            { $concat: [
                                '0', { $substr: [ { $month: { date: field, timezone: tz } }, 0, 2 ] }
                            ]},
                            { $substr: [ { $month: { date: field, timezone: tz } }, 0, 2 ] }
                        ]},
                        '-',
                        { $cond: [
                            { $lte: [ { $dayOfMonth: { date: field, timezone: tz } }, 9 ] },
                            { $concat: [
                                '0', { $substr: [ { $dayOfMonth: { date: field, timezone: tz } }, 0, 2 ] }
                            ]},
                            { $substr: [ { $dayOfMonth: { date: field, timezone: tz } }, 0, 2 ] }
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
                groupStage.$group._id = { frequency: { $isoWeek: { date: field, timezone: tz } } };
                break;
            case FrequencyEnum.Monthly:
                if (!projectStage.$project) projectStage.$project = { };

                // add to the projection the frequency field with year and month: YYYY-MM
                projectStage.$project.frequency = {
                    $concat: [
                        { $substr: [ { $year: { date: field, timezone: tz } }, 0, 4 ] },
                        '-',
                        { $cond: [
                            { $lte: [ { $month: { date: field, timezone: tz } }, 9 ] },
                            { $concat: [
                                '0', { $substr: [ { $month: { date: field, timezone: tz } }, 0, 2 ] }
                            ]},
                            { $substr: [ { $month: { date: field, timezone: tz } }, 0, 2 ] }
                        ]}
                    ]
                };

                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: '$frequency' };
                break;
            case FrequencyEnum.Quarterly:
                // I need to add a projection if it does not exist
                if (!projectStage.$project) projectStage.$project = {};

                projectStage.$project.frequency = {
                    $concat: [
                        { $substr: [ { $year: { date: field, timezone: tz } }, 0, 4 ] },
                        '-',
                        { $cond: [
                            { $lte: [{ $month: { date: field, timezone: tz } }, 3] },
                                'Q1',
                                { $cond: [
                                    { $lte: [{ $month: { date: field, timezone: tz } }, 6] },
                                        'Q2',
                                        { $cond: [
                                            { $lte: [{ $month: { date: field, timezone: tz } }, 9] },
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
                groupStage.$group._id = { frequency: { $year: { date: field, timezone: tz } } };
                break;
        }

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
                group._id[camelCase(g)] = '$' + g;
            }
        });
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

    protected _processFormulaFields(): boolean {
        const formulaFields = this._vsAggregateService.getFormulaFields(this.kpiVirtualSources.virtualSource);

        let formulaFieldsStage = this.findStage('formulaFields', '$addFields');

        if (!formulaFieldsStage) {
            throw new Error('cannot inject formula field because an addFields stage could not be found');
        }

        const __now__ = new Date(Date.now());

        const replacements: IKeyValues = {
           __now__
        };


        for (const field of formulaFields) {
            const cleanFormula = this._cleanFilter(field.value.formula);
            this._vsAggregateService.walkAndReplace(cleanFormula, ObjectReplacementPattern, replacements);

            formulaFieldsStage.$addFields[field.value.path] = cleanFormula;
        }

        if (Object.keys(formulaFieldsStage.$addFields).length > 0) return;

        const index = this.aggregate.indexOf(formulaFieldsStage);
        if (index !== -1) this.aggregate.splice(index, 1);
    }

    protected _classifyFilters(filter: any): { regularFilter: any, formulaFieldFilter: any } {
        let regularFilter = {};
        const formulaFieldFilter = {};

        if (!filter || !Object.keys(filter).length) return { regularFilter, formulaFieldFilter };

        const formulaFields = this._vsAggregateService.getFormulaFields(this.kpiVirtualSources.virtualSource);

        let cleanFilter = this._vsAggregateService.cleanFilter(filter);

        let cleanFilterWithAnd;

        if (cleanFilter['$and']) {
            cleanFilterWithAnd = cleanFilter;
            cleanFilter = cleanFilter['$and'];
        }

        if (cleanFilterWithAnd) {
            for (filter of cleanFilter) {
                Object.keys(filter).forEach(filterKey => {
                    // do not add top to the filter, that gets applied in the end
                    if (filterKey === 'top') return;

                    if (formulaFields.some(f => f.value.path === filterKey)) {
                        formulaFieldFilter[filterKey] =
                            merge(formulaFieldFilter[filterKey] || {}, filter[filterKey]);
                        return;
                    }

                    regularFilter[filterKey]
                        = merge(regularFilter[filterKey] || {}, filter[filterKey]);
                });
            }
        } else {
            Object.keys(cleanFilter).forEach(filterKey => {
                // do not add top to the filter, that gets applied in the end
                if (filterKey === 'top') return;

                if (formulaFields.some(f => f.value.path === filterKey)) {
                    formulaFieldFilter[filterKey] = cleanFilter[filterKey];
                    return;
                }

                regularFilter[filterKey] = cleanFilter[filterKey];

            });
        }

        if (cleanFilterWithAnd) {
            const newRegularFilter = {};

            if (Object.entries(regularFilter).length) {
                newRegularFilter['$and'] = [];

                for (const [key, value] of Object.entries(regularFilter)) {
                    newRegularFilter['$and'].push({ [key]: value });
                }
            }

            regularFilter = newRegularFilter;
        }

        return { regularFilter, formulaFieldFilter };
    }
}