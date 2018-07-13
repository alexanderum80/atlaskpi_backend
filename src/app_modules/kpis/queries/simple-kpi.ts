import { FinancialActivities } from './../../../domain/app/financial-activities/financial-activity.model';
import { cloneDeep } from 'lodash';

import { Calls } from '../../../domain/app/calls/call.model';
import { Expenses } from '../../../domain/app/expenses/expense.model';
import { Inventory } from '../../../domain/app/inventory/inventory.model';
import { IKPI, IKPIDocument, IKPISimpleDefinition, KPITypeEnum } from '../../../domain/app/kpis/kpi';
import { KPIExpressionHelper } from '../../../domain/app/kpis/kpi-expression.helper';
import { KPIFilterHelper } from '../../../domain/app/kpis/kpi-filter.helper';
import { Sales } from '../../../domain/app/sales/sale.model';
import { IVirtualSourceDocument } from '../../../domain/app/virtual-sources/virtual-source';
import { IDateRange } from '../../../domain/common/date-range';
import { FrequencyEnum } from '../../../domain/common/frequency-enum';
import { Appointments } from './../../../domain/app/appointments/appointment-model';
import { COGS } from './../../../domain/app/cogs/cogs.model';
import { Payments } from './../../../domain/app/payments/payment.model';
import { AggregateStage } from './aggregate';
import { ICollection, IGetDataOptions, IKpiBase } from './kpi-base';
import { SimpleKPIBase } from './simple-kpi-base';

export const CollectionsMapping = {
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
    },
    calls: {
        modelName: 'Call',
        timestampField: 'created_at'
    },
    appointments: {
        modelName: 'Appointment',
        timestampField: 'from'
    }
};

export class SimpleKPI extends SimpleKPIBase implements IKpiBase {

    public static CreateFromExpression( kpi: IKPIDocument,
                                        sales: Sales,
                                        expenses: Expenses,
                                        inventory: Inventory,
                                        calls: Calls,
                                        appointments: Appointments,
                                        payments: Payments,
                                        cogs: COGS,
                                        financialActivities: FinancialActivities,
                                        virtualSources: IVirtualSourceDocument[],
                                        timezone: string
                                    ): SimpleKPI {

        const simpleKPIDefinition: IKPISimpleDefinition = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.Simple, kpi.expression);
        let collection: ICollection;
        let baseAggregate: any;

        if (virtualSources) {
            const virtualSource = virtualSources.find(s => s.name.toLocaleLowerCase() === simpleKPIDefinition.dataSource.toLowerCase());

            if (virtualSource) {
                collection = {
                    modelName: virtualSource.modelIdentifier,
                    timestampField: virtualSource.dateField
                };

                simpleKPIDefinition.dataSource = virtualSource.source.toLowerCase();

                if (virtualSource.aggregate) {
                    baseAggregate = virtualSource.aggregate.map(a => {
                        return KPIFilterHelper.CleanObjectKeys(a);
                    });
                }
            }
        }

        if (!collection) {
            collection = CollectionsMapping[simpleKPIDefinition.dataSource];
        }

        if (!collection) { return null; }

        const models = {
            Sale: sales.model,
            Expense: expenses.model,
            Inventory: inventory.model,
            Call: calls.model,
            Appointment: appointments.model,
            Payment: payments.model,
            COGS: cogs.model,
            FinancialActivity: financialActivities.model
        };

        const model = models[collection.modelName];
        let aggregateSkeleton: AggregateStage[] = [
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
                topN: true,
                $sort: {
                    '_id.frequency': 1
                }
            }
        ];

        if (baseAggregate) {
            aggregateSkeleton = baseAggregate.concat(aggregateSkeleton);
        }

        return new SimpleKPI(model, aggregateSkeleton, simpleKPIDefinition, kpi, collection, timezone);
    }

    private constructor(model: any, baseAggregate: any, definition: IKPISimpleDefinition, kpi: IKPI, collection: ICollection, timezone: string) {
        super(model, baseAggregate);

        this.timezone = timezone;
        this.kpi = kpi;
        this.collection = collection;

        let deserializedFilter;

        if (this.kpi && this.kpi.filter)
            deserializedFilter = this._cleanFilter(this.kpi.filter);

        if (deserializedFilter)
            this._injectPreGroupStageFilters(deserializedFilter, null);
            // this._injectPreGroupStageFilters(deserializedFilter, definition.field);

        this._injectFieldToProjection(definition.field);
        this._injectAcumulatorFunctionAndArgs(definition);

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