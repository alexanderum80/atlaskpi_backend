import { FinancialActivities } from './../../../domain/app/financial-activities/financial-activity.model';
import { cloneDeep, camelCase } from 'lodash';

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
import { getGenericModel } from '../../../domain/common/fields-with-data';

export class SimpleKPI extends SimpleKPIBase implements IKpiBase {

    public static CreateFromExpression( kpi: IKPIDocument,
                                        virtualSources: IVirtualSourceDocument[],
                                        timezone: string
                                    ): SimpleKPI {

        const simpleKPIDefinition: IKPISimpleDefinition = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.Simple, kpi.expression);
        let collection: ICollection;
        let baseAggregate: any;

        // if (virtualSources) {
        const virtualSource = virtualSources.find(s => s.name.toLocaleLowerCase() === simpleKPIDefinition.dataSource.toLocaleLowerCase());
        const parentVirtualSource = virtualSources.find(s => s.name.toLocaleLowerCase() === virtualSource.source.toLowerCase());

        if (virtualSource) {
            collection = {
                modelName: virtualSource.modelIdentifier,
                timestampField: virtualSource.dateField
            };


            const preVSAggregateStages = [];

            // decide if we need to apply the daterange before the vs aggregate
            if (parentVirtualSource) {
                if (Object.values(parentVirtualSource.fieldsMap).some(f => f.path === collection.timestampField)
                   && virtualSource.aggregate
                   && virtualSource.aggregate.length) {
                    const applyVsDateRange =  {
                        vsDateRange: true,
                        '$match': { [collection.timestampField]: { } }
                    };
                    preVSAggregateStages.push(applyVsDateRange);
                }
            }

            simpleKPIDefinition.dataSource = camelCase(virtualSource.source);

            if (virtualSource.aggregate) {
                baseAggregate = [
                    // put a match stage before the aggregate
                    ...preVSAggregateStages,
                    ...virtualSource.aggregate.map(a => {
                        return KPIFilterHelper.CleanObjectKeys(a);
                    })
                ];
            }
        }
        // }

        const model = getGenericModel(virtualSource.db, virtualSource.modelIdentifier, virtualSource.source); //  models[collection.modelName];

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