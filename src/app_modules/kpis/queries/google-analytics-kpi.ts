import { cloneDeep } from 'lodash';
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

const fieldMetricsMap = {
    users: 'ga:users',
    newUsers: 'ga:newUsers',
    sessions: 'ga:sessions',
    sessionsPerUser: 'ga:sessionsPerUser',
    pageviews: 'ga:pageviews',
    pageviewsPerSession: 'ga:pageviewsPerSession',
    avgSessionDuration: 'ga:avgSessionDuration',
    bounceRate: 'ga:bounceRate'
};

export class GoogleAnalyticsKpi extends SimpleKPIBase implements IKpiBase {

    public static CreateFromExpression( kpi: IKPIDocument,
                                        googleAnalytics: GoogleAnalytics,
                                        googleAnalyticsKpiService): GoogleAnalyticsKpi {

        const kpiDefinition: IKPISimpleDefinition = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.GoogleAnalytics, kpi.expression);

        const coonectorId = kpiDefinition.dataSource;

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

        return new GoogleAnalyticsKpi(googleAnalytics.model, aggregateSkeleton, kpiDefinition, kpi, googleAnalyticsKpiService);
    }


    private constructor(model: any,
                        baseAggregate: any,
                        private _definition: IKPISimpleDefinition,
                        private _kpi: IKPI,
                        private _googleAnalyticsKpiService: GoogleAnalyticsKPIService) {
        super(model, baseAggregate);

        this.collection = { modelName: 'GoogleAnalytics', timestampField: 'date' };

        let deserializedFilter;

        if (this.kpi && this.kpi.filter)
            deserializedFilter = this._cleanFilter(this.kpi.filter);

        if (deserializedFilter)
            this._injectPreGroupStageFilters(deserializedFilter, _definition.field);

        this._injectFieldToProjection(_definition.field);
        this._injectAcumulatorFunctionAndArgs(_definition);

        if (deserializedFilter)
            this._injectPostGroupStageFilters(deserializedFilter, _definition.field);

        this.pristineAggregate = cloneDeep(baseAggregate);
    }

    getData(dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any> {
        const firstDateRange = dateRange && dateRange[0];

        const startDate = moment(firstDateRange.from).format('YYYY-MM-DD');
        const endDate = moment(firstDateRange.to).format('YYYY-MM-DD');

        const that = this;
        return new Promise<any>((resolve, reject) => {
            return this._googleAnalyticsKpiService
                .initialize(this._definition.dataSource)
                .then(() => {
                   return that._googleAnalyticsKpiService
                              .getData( startDate,
                                        endDate,
                                        [fieldMetricsMap[this._definition.field]],
                                        []);
                })
                .then(batch => {
                    mongoose.set('debug', true);
                    that._injectPreGroupStageFilters({ _batchId: batch._batchId }, that._definition.field);
                    this.executeQuery(this.collection.timestampField, dateRange, options).then(data => {
                        resolve(data);
                        return;
                    });
                })
                .catch(err => reject(err));
        });
    }
}