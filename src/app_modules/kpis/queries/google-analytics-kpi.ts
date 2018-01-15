import { IBatchProperties } from './../../../services/kpis/google-analytics-kpi/google-analytics.helper';
import { cloneDeep, uniq } from 'lodash';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { GoogleAnalytics } from '../../../domain/app/google-analytics/google-analytics.model';
import { IKPIDocument, IKPISimpleDefinition, KPITypeEnum, IKPI } from '../../../domain/app/kpis/kpi';
import { IDateRange } from '../../../domain/common/date-range';
import { KPIExpressionHelper } from './../../../domain/app/kpis/kpi-expression.helper';
import { AggregateStage } from './aggregate';
import { IGetDataOptions, IKpiBase, KpiBase, ICollection } from './kpi-base';
import { GoogleAnalyticsKPIService } from '../../../services/kpis/google-analytics-kpi/google-analytics-kpi.service';
import { SimpleKPIBase } from './simple-kpi-base';

export class GoogleAnalyticsKpi extends SimpleKPIBase implements IKpiBase {

    private _deserializedFilter = {};

    public static CreateFromExpression( kpi: IKPIDocument,
                                        googleAnalytics: GoogleAnalytics,
                                        googleAnalyticsKpiService): GoogleAnalyticsKpi {

        const kpiDefinition: IKPISimpleDefinition = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.ExternalSource, kpi.expression);

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

        kpiDefinition.dataSource = kpiDefinition.dataSource.replace('$', '');

        return new GoogleAnalyticsKpi(googleAnalytics.model, aggregateSkeleton, kpiDefinition, kpi, googleAnalyticsKpiService);
    }


    private constructor(model: any,
                        private _baseAggregate: any,
                        private _definition: IKPISimpleDefinition,
                        private _kpi: IKPI,
                        private _googleAnalyticsKpiService: GoogleAnalyticsKPIService) {
        super(model, _baseAggregate);

        this.collection = { modelName: 'GoogleAnalytics', timestampField: 'date' };

        if (this._kpi && this._kpi.filter)
            this._deserializedFilter = this._cleanFilter(this._kpi.filter);

        if (this._deserializedFilter)
            this._injectPreGroupStageFilters(this._deserializedFilter, _definition.field);

        this._injectFieldToProjection(_definition.field);
        this._injectAcumulatorFunctionAndArgs(_definition);

        if (this._deserializedFilter)
            this._injectPostGroupStageFilters(this._deserializedFilter, _definition.field);
    }

    getData(dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any> {
        mongoose.set('debug', true);
        const firstDateRange = dateRange && dateRange[0];

        const startDate = moment(firstDateRange.from).format('YYYY-MM-DD');
        const endDate = moment(firstDateRange.to).format('YYYY-MM-DD');

        // we need to call the ga api including any dimension included in the filters
        const filterGroupings = Object.keys(this._deserializedFilter).filter(k => k !== this._definition.field);

        const that = this;
        return this._cacheData(dateRange, options, filterGroupings)
                    .then(batch => {
                        that._injectPreGroupStageFilters({ _batchId: batch._batchId }, that._definition.field);
                        that.pristineAggregate = cloneDeep(that._baseAggregate);
                        return that.executeQuery(this.collection.timestampField, dateRange, options);
                    });
    }

    private _cacheData(dateRange?: IDateRange[], options?: IGetDataOptions, filterGroupungs?: string[]): Promise<IBatchProperties> {
        mongoose.set('debug', true);
        const firstDateRange = dateRange && dateRange[0];

        const startDate = moment(firstDateRange.from).format('YYYY-MM-DD');
        const endDate = moment(firstDateRange.to).format('YYYY-MM-DD');

        // get the groupings
        // options groupings have precedence over kpi groupings
        let groupings = options.groupings  && options.groupings.length  && options.groupings  ||
                          this._kpi.groupings && this._kpi.groupings.length && this._kpi.groupings ||
                          [];

        groupings = [...groupings, ...filterGroupungs];

        const that = this;
        return this ._googleAnalyticsKpiService
                    .initializeConnection(this._definition.dataSource)
                    .then((res) => {
                        return that._googleAnalyticsKpiService
                                    .cacheData( res.analytics,
                                                res.authClient,
                                                startDate,
                                                endDate,
                                                this._definition.field,
                                                options.frequency,
                                                groupings);
                    });
    }
}