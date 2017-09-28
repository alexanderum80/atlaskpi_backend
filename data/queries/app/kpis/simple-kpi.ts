import { IKPI } from '../../../models/app/kpis';
import { IAppModels } from './../../../models/app/app-models';
import { KPITypeEnum, IKPISimpleDefinition, IKPIDocument } from './../../../models/app/kpis/IKPI';
import { KPIExpressionHelper } from '../../../models/app/kpis/kpi-expression.helper';
import { IExpenseModel } from '../../../models/app/expenses';
import * as Promise from 'bluebird';
import { AggregateStage } from './aggregate';
import { IGetDataOptions, IKpiBase, KpiBase } from './kpi-base';
import { FrequencyEnum } from '../../../models/common/frequency-enum';
import { IDateRange } from '../../../models/common/date-range';
import * as changeCase from 'change-case';

import * as _ from 'lodash';

const CollectionModelTableMapping = {
    sales: 'Sale',
    expenses: 'Expense'
};

export class SimpleKPI extends KpiBase implements IKpiBase {

    public static CreateFromExpression(models: IAppModels, kpi: IKPIDocument): SimpleKPI {
        const simpleKPIDefinition: IKPISimpleDefinition = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.Simple, kpi.expression);
        const model = models[CollectionModelTableMapping[simpleKPIDefinition.dataSource]];
        const aggregateSkeleton: AggregateStage[] = [
            {
                filter: true,
                $match: { }
            },
            {
                frequency: true,
                $project: {
                    '_id': 0
                }
            },
            {
                frequency: true,
                $group: {
                    _id: { }
                }
            },
            {
                postGroupFilter: true,
                $match: { }
            },
            {
                $sort: {
                    frequency: 1
                }
            }
        ];
        return new SimpleKPI(model, aggregateSkeleton, simpleKPIDefinition, kpi);
    }

    private constructor(model: any, baseAggregate: any, definition: IKPISimpleDefinition, kpi: IKPI) {
        super(model, baseAggregate);

        this.kpi = kpi;

        let deserializedFilter;

        if (this.kpi && this.kpi.filter)
            deserializedFilter = this._cleanFilter(this.kpi.filter);

        if (deserializedFilter)
            this._injectPreGroupStageFilters(deserializedFilter, definition.field);

        this._injectFieldToProjection(definition.field);
        this._injectAcumulatorFunctionAndArgs(definition);

        if (deserializedFilter)
            this._injectPostGroupStageFilters(deserializedFilter, definition.field);
    }

    getData(dateRange: IDateRange, options?: IGetDataOptions): Promise<any> {
        return this.executeQuery('timestamp', dateRange, options);
    }

    getSeries(dateRange: IDateRange, frequency: FrequencyEnum) {}

    private _injectFieldToProjection(fieldName: string) {
        const  projectStage = this.findStage('frequency', '$project');

        const fieldTokens = fieldName.split('.');

        projectStage.$project[fieldTokens[0]] = 1;
    }

    private _injectAcumulatorFunctionAndArgs(definition: IKPISimpleDefinition) {
        const groupStage = this.findStage('frequency', '$group');

        const value = this._getValueObject(definition);

        groupStage.$group.value = value;
    }

    private _injectPreGroupStageFilters(filter: any, excludedField: string) {
        let matchStage = this.findStage('filter', '$match');

        if (!matchStage) {
            throw 'KpiBase#_injectPreGroupStageFilters: Cannot inject filter because a dateRange/$match stage could not be found';
        }

        const clone = _.cloneDeep(filter);
        const preFilter = this._filterWithNoAggField(clone, excludedField);

        Object.keys(preFilter).forEach(filterKey => {
            matchStage.$match[filterKey] = preFilter[filterKey];
        });
    }

    private _filterWithNoAggField(filter: any, fieldName: string) {
        let newFilter = {};

        Object.keys(filter).forEach(filterKey => {
            if (filterKey === fieldName) return;

            let value = filter[filterKey];

            if (!_.isArray(value) && _.isObject(value)) {
                value = this._filterWithNoAggField(value, fieldName);
            } else if (_.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    value[i] = this._filterWithNoAggField(value[i], fieldName);
                }
            }

            newFilter[filterKey] = value;
        });

        return newFilter;
    }

    private aggFieldFilterOnly(filter: any, fieldName: string) {
        let filterObj;

        Object.keys(filter).forEach(filterKey => {
            if (filterKey === fieldName) {
                filterObj = filter[filterKey];
            }

            let value = filter[filterKey];

            if (!_.isArray(value) && _.isObject(value)) {
                const found = this.aggFieldFilterOnly(value, fieldName);
                if (found) { filterObj = found; }
            } else if (_.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    const found = this.aggFieldFilterOnly(value[i], fieldName);
                    if (found) { filterObj = found; }
                }
            }
        });

        return filterObj;
    }

    private _injectPostGroupStageFilters(filter: any, aggField: string) {
        let postGroupMatchStage = this.findStage('postGroupFilter', '$match');

        if (!postGroupMatchStage) {
            throw 'KpiBase#_injectPostGroupStageFilters: Cannot inject filter because a postGroupMatch stage could not be found';
        }

        const clone = _.cloneDeep(filter);
        const postGroupFilter = this.aggFieldFilterOnly(clone, aggField);

        if (postGroupFilter) {
            postGroupMatchStage.$match['value'] = postGroupFilter;
        }
    }

    private _getValueObject(definition: IKPISimpleDefinition): any {
        switch (definition.function) {
            case 'count':
                return { $sum: 1 };

            default:
                const func = '$' + definition.function;
                const value = { };
                value[func] = this._getAcumulatorObject(definition);
                return value;
        }
    }

    private _getAcumulatorObject(definition: IKPISimpleDefinition): any {
        const field = '$' + definition.field;

        if (!definition.operator) {
            return field;
        }

        const fieldOperandArray = [ field, definition.value ];

        switch (definition.operator) {
            case '*':
                return { $multiply: fieldOperandArray };

            case '/':
                return { $divide: fieldOperandArray };

            case '-':
                return { $subtract: fieldOperandArray };

            case '+':
                return { $add: fieldOperandArray };
        }
    }



}