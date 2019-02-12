import { isArray } from 'util';
import { cloneDeep, isObject, isDate } from 'lodash';
import { KpiBase, IKpiBase } from './kpi-base';
import { isRegExp, isArrayObject } from '../../../helpers/express.helpers';
import { IKPISimpleDefinition } from '../../../domain/app/kpis/kpi';

export class SimpleKPIBase extends KpiBase {
    // simple kpi methods now beign used by google analytics kpi

    protected _injectPreGroupStageFilters(filter: any, excludedField: string) {
        let matchStage = this.findStage('filter', '$match');

        if (!matchStage) {
            throw 'KpiBase#_injectPreGroupStageFilters: Cannot inject filter because a dateRange/$match stage could not be found';
        }

        const clone = cloneDeep(filter);
        const preFilter = this._filterWithNoAggField(clone, excludedField);

        Object.keys(preFilter).forEach(filterKey => {
            matchStage.$match[filterKey] = preFilter[filterKey];
        });
    }

    protected _filterWithNoAggField(filter: any, fieldName: string) {
        let newFilter = {};

        Object.keys(filter).forEach(filterKey => {
            if (filterKey === fieldName) return;

            let value = filter[filterKey];

            if (!isArray(value) && (!isDate(value)) && (!isRegExp(value)) && isObject(value)) {
                value = this._filterWithNoAggField(value, fieldName);
            } else if ((!isDate(value)) && isArrayObject(value)) {
                for (let i = 0; i < value.length; i++) {
                    value[i] = this._filterWithNoAggField(value[i], fieldName);
                }
            }

            newFilter[filterKey] = value;
        });

        return newFilter;
    }

    protected _injectAcumulatorFunctionAndArgs(definition: IKPISimpleDefinition) {
        const groupStage = this.findStage('frequency', '$group');

        const value = this._getValueObject(definition);

        groupStage.$group.value = value;
    }

    protected _getValueObject(definition: IKPISimpleDefinition): any {
        switch (definition.function) {
            case 'count':
                return { $sum: this._getAcumulatorObject(definition, 1) };

            default:
                const func = '$' + definition.function;
                const value = { };
                value[func] = this._getAcumulatorObject(definition);
                return value;
        }
    }

    protected _getAcumulatorObject(definition: IKPISimpleDefinition, overrideFieldValue?: number): any {
        const field = overrideFieldValue || `$${definition.field}`;

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

    protected _injectPostGroupStageFilters(filter: any, aggField: string) {
        let postGroupMatchStage = this.findStage('postGroupFilter', '$match');

        if (!postGroupMatchStage) {
            throw 'KpiBase#_injectPostGroupStageFilters: Cannot inject filter because a postGroupMatch stage could not be found';
        }

        const clone = cloneDeep(filter);
        const postGroupFilter = this.aggFieldFilterOnly(clone, aggField);

        if (postGroupFilter) {
            postGroupMatchStage.$match['value'] = postGroupFilter;
        }

        if (Object.keys(postGroupMatchStage.$match).length > 0) return;

        const index = this.aggregate.indexOf(postGroupMatchStage);
        if (index !== -1) this.aggregate.splice(index, 1);
    }

    protected aggFieldFilterOnly(filter: any, fieldName: string) {
        let filterObj;

        Object.keys(filter).forEach(filterKey => {
            if (filterKey === fieldName) {
                filterObj = filter[filterKey];
            }

            let value = filter[filterKey];

            if (!isArray(value) && (!isDate(value)) && (!isRegExp(value)) && isObject(value)) {
                const found = this.aggFieldFilterOnly(value, fieldName);
                if (found) { filterObj = found; }
            } else if ((!isDate(value)) && isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    const found = this.aggFieldFilterOnly(value[i], fieldName);
                    if (found) { filterObj = found; }
                }
            }
        });

        return filterObj;
    }

    protected _injectFieldToProjection(fieldName: string) {
        const  projectStage = this.findStage('frequency', '$project');
        const fieldTokens = fieldName.split('.');

        projectStage.$project[fieldTokens[0]] = 1;

        // we check where the timestamp field is, if is not in the projection then we add it
        const timestampFieldTokens = this.collection.timestampField.split('.');
        if (fieldTokens[0] !== timestampFieldTokens[0]) {
            projectStage.$project[timestampFieldTokens[0]] = 1;
        }
    }
}
