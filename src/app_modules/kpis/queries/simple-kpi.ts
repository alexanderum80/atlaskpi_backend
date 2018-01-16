import { SimpleKPIBase } from './simple-kpi-base';
import { Expenses } from '../../../domain/app/expenses/expense.model';
import { Inventory } from '../../../domain/app/inventory/inventory.model';
import * as Promise from 'bluebird';
import { IKPI, IKPIDocument, IKPISimpleDefinition, KPITypeEnum } from '../../../domain/app/kpis/kpi';
import { KPIExpressionHelper } from '../../../domain/app/kpis/kpi-expression.helper';
import { Sales } from '../../../domain/app/sales/sale.model';
import { IDateRange } from '../../../domain/common/date-range';
import { FrequencyEnum } from '../../../domain/common/frequency-enum';
import { field } from '../../../framework/decorators/field.decorator';
import { AggregateStage } from './aggregate';
import { IGetDataOptions, IKpiBase, KpiBase, ICollection } from './kpi-base';
import { isArrayObject, isRegExp } from '../../../helpers/express.helpers';

import * as changeCase from 'change-case';

import {
    cloneDeep,
    isArray,
    isObject
} from 'lodash';

const CollectionsMapping = {
    sales: {
        modelName: 'Sale',
        timestampField: 'product.from'
    },
    expenses: {
        modelName: 'Expense',
        timestampField: 'timestamp'
    },
    inventory: {
        modelName: 'Inventory',
        timestampField: 'updatedAt'
    }
};

export class SimpleKPI extends SimpleKPIBase implements IKpiBase {

    public static CreateFromExpression( kpi: IKPIDocument,
                                        sales: Sales,
                                        expenses: Expenses,
                                        inventory: Inventory
                                    ): SimpleKPI {
        const simpleKPIDefinition: IKPISimpleDefinition = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.Simple, kpi.expression);

        const collection: ICollection = CollectionsMapping[simpleKPIDefinition.dataSource];
        if (!collection) { return null; }

        const models = {
            Sale: sales.model,
            Expense: expenses.model,
            Inventory: inventory.model,
        };

        const model = models[collection.modelName];
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
                    '_id.frequency': 1
                }
            }
        ];
        return new SimpleKPI(model, aggregateSkeleton, simpleKPIDefinition, kpi, collection);
    }

    private constructor(model: any, baseAggregate: any, definition: IKPISimpleDefinition, kpi: IKPI, collection: ICollection) {
        super(model, baseAggregate);

        this.kpi = kpi;
        this.collection = collection;

        let deserializedFilter;

        if (this.kpi && this.kpi.filter)
            deserializedFilter = this._cleanFilter(this.kpi.filter);

        if (deserializedFilter)
            this._injectPreGroupStageFilters(deserializedFilter, definition.field);

        this._injectFieldToProjection(definition.field);
        this._injectAcumulatorFunctionAndArgs(definition);

        if (deserializedFilter)
            this._injectPostGroupStageFilters(deserializedFilter, definition.field);

        this.pristineAggregate = cloneDeep(baseAggregate);
    }

    getData(dateRange: IDateRange[], options?: IGetDataOptions): Promise<any> {
        return this.executeQuery(this.collection.timestampField, dateRange, options);
    }

    getTargetData(dateRange: IDateRange[], options?: IGetDataOptions): Promise<any> {
        return this.executeQuery(this.collection.timestampField, dateRange, options);
    }

    getSeries(dateRange: IDateRange, frequency: FrequencyEnum) {}

}