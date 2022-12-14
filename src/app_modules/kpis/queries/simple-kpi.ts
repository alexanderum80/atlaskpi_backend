import { cloneDeep, camelCase, isEmpty } from 'lodash';
import { IKPI, IKPIDocument, IKPISimpleDefinition, KPITypeEnum } from '../../../domain/app/kpis/kpi';
import { KPIExpressionHelper } from '../../../domain/app/kpis/kpi-expression.helper';
import { KPIFilterHelper } from '../../../domain/app/kpis/kpi-filter.helper';
import { IVirtualSourceDocument, IVirtualSource } from '../../../domain/app/virtual-sources/virtual-source';
import { IDateRange } from '../../../domain/common/date-range';
import { FrequencyEnum } from '../../../domain/common/frequency-enum';
import { AggregateStage } from './aggregate';
import { ICollection, IGetDataOptions, IKpiBase, IKpiVirtualSources } from './kpi-base';
import { SimpleKPIBase } from './simple-kpi-base';
import { getGenericModel } from '../../../domain/common/fields-with-data';
import { VirtualSourceAggregateService } from '../../../domain/app/virtual-sources/vs-aggregate.service';

export class SimpleKPI extends SimpleKPIBase implements IKpiBase {

    public static CreateFromExpression( kpi: IKPIDocument,
                                        virtualSources: IVirtualSourceDocument[],
                                        timezone: string,
                                        vsAggregateService: VirtualSourceAggregateService
                                    ): SimpleKPI {

        const simpleKPIDefinition: IKPISimpleDefinition = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.Simple, kpi.expression);
        let collection: ICollection;

        const virtualSource = virtualSources.find(s => s.name.toLocaleLowerCase() === simpleKPIDefinition.dataSource.toLocaleLowerCase());
        const parentVirtualSource = virtualSources.find(s => s.name.toLocaleLowerCase() === (virtualSource && virtualSource.source.toLowerCase()));

        if (!virtualSource) throw new Error('cannot create a kpi without a virtual source');

        const kpiVirtualSources: IKpiVirtualSources = {
            virtualSource,
            parentVirtualSource
        };

        collection = {
            modelName: virtualSource.modelIdentifier,
            timestampField: virtualSource.dateField
        };

        simpleKPIDefinition.dataSource = camelCase(virtualSource.source);

        const model = getGenericModel(virtualSource.db, virtualSource.modelIdentifier, virtualSource.source); //  models[collection.modelName];

        let aggregateSkeleton: AggregateStage[] = [
            {
                filter: true,
                $match: { }
            },
            {
                formulaFields: true,
                $addFields: { }
            },
            {
                formulaFieldsFilter: true,
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

        return new SimpleKPI(
            model,
            aggregateSkeleton,
            simpleKPIDefinition,
            kpi,
            collection,
            timezone,
            kpiVirtualSources,
            vsAggregateService
        );
    }

    private constructor(model: any, baseAggregate: any, definition: IKPISimpleDefinition,
                        kpi: IKPI, collection: ICollection, timezone: string, kpiVirtualSources: IKpiVirtualSources,
                        vsAggregateService: VirtualSourceAggregateService) {
        super(model, baseAggregate, kpiVirtualSources);

        this.timezone = timezone;
        this.kpi = kpi;
        this.collection = collection;

        this._vsAggregateService = vsAggregateService;

        let deserializedFilter;

        if (this.kpi && this.kpi.filter)
            deserializedFilter = this._cleanFilter(this.kpi.filter);

        const { regularFilter, formulaFieldFilter } = this._classifyFilters(deserializedFilter);

        if (Object.keys(regularFilter).length)
            this._injectPreGroupStageFilters(regularFilter, null);

        // this method should be called always, it removes the addFields stage
        // if no formula fields present in the virtual source
        this._processFormulaFields();

        // this method should be called always, it removes the match stage
        // if no filters for formula fields
        this._injectFormulaFieldFilter(formulaFieldFilter);

        // if (deserializedFilter)
        //     this._injectPreGroupStageFilters(deserializedFilter, null);
        //     // this._injectPreGroupStageFilters(deserializedFilter, definition.field);

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