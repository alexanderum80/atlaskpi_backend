import { IBatchProperties } from './../../../services/kpis/google-analytics-kpi/google-analytics.helper';
import { cloneDeep, uniq } from 'lodash';
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
import { IVirtualSourceDocument } from '../../../domain/app/virtual-sources/virtual-source';

export class GoogleAnalyticsKpi extends SimpleKPIBase implements IKpiBase {

    // private _deserializedFilter = {};

    public static CreateFromExpression( kpi: IKPIDocument,
                                        googleAnalytics: GoogleAnalytics,
                                        googleAnalyticsKpiService: GoogleAnalyticsKPIService,
                                        virtualSources: IVirtualSourceDocument[]): GoogleAnalyticsKpi {

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
                topN: true,
                $sort: {
                    '_id.frequency': 1
                }
            }
        ];

        // I can get virtual source here by the name
        kpiDefinition.dataSource = kpiDefinition.dataSource.replace('$', '');
        const gaVirtualSource = virtualSources.find(vs => vs.name === 'google_analytics');

        return new GoogleAnalyticsKpi(googleAnalytics.model, aggregateSkeleton, kpiDefinition, kpi, googleAnalyticsKpiService, gaVirtualSource);
    }


    private constructor(model: any,
                        private _baseAggregate: any,
                        private _definition: IKPISimpleDefinition,
                        private _kpi: IKPI,
                        private _googleAnalyticsKpiService: GoogleAnalyticsKPIService,
                        private _virtualSource: IVirtualSourceDocument) {
        super(model, _baseAggregate);

        this.collection = { modelName: 'GoogleAnalytics', timestampField: 'date' };

        // if (this._kpi && this._kpi.filter)
        //     this._deserializedFilter = this._cleanFilter(this._kpi.filter);

        // if (this._deserializedFilter)
        //     this._injectPreGroupStageFilters({}, _definition.field);

        this._injectFieldToProjection(_definition.field);
        this._injectAcumulatorFunctionAndArgs(_definition);

        // if (this._deserializedFilter)
        //     this._injectPostGroupStageFilters(this._deserializedFilter, _definition.field);
    }

    getData(dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any> {
        const firstDateRange = dateRange && dateRange[0];

        const startDate = moment(firstDateRange.from).format('YYYY-MM-DD');
        const endDate = moment(firstDateRange.to).format('YYYY-MM-DD');

        // the way to deal with and cases for google analytics its a little bit different
        if (this._kpi.filter) {
            var andOptions = this._kpi.filter['__dollar__and'];
        
            if (andOptions) {
                const f = {};

                andOptions.forEach(o => {
                    const firstKey = Object.keys(o)[0];
                    f[firstKey] = o[firstKey];
                });

                this._kpi.filter = f;
            }
        }
        

        const preparedFilters = this._getFilterString(this._kpi.filter);
        let filterGroupings = null;

        // we need to call the ga api including any dimension included in the filters
        if (this._kpi.filter) {
            filterGroupings = Object.keys(this._kpi.filter).filter(k => k !== this._definition.field);
        }

        const that = this;
        return this._cacheData(dateRange, preparedFilters, options, filterGroupings)
                    .then(batch => {
                        that._injectPreGroupStageFilters({ _batchId: batch._batchId }, that._definition.field);
                        that.pristineAggregate = cloneDeep(that._baseAggregate);
                        return that.executeQuery(this.collection.timestampField, dateRange, options);
                    });
    }

    private _getFilterString(filterObj: any): string {
        if (!filterObj) {
            return null;
        }

        let filterString = null;

        Object.keys(filterObj).forEach(k => {
            const field = this._virtualSource.getFieldDefinition(k);
            const filter = filterObj[k];

            if (!filter) {
                return;
            }

            const filterKeys = Object.keys(filter);

            if (!filterKeys || !filterKeys.length) {
                return;
            }

            let filterValue = filter[filterKeys[0]];
            const filterName = filterKeys[0].trim().replace(/^\__dollar__/, '');
            const operator = this._virtualSource.getDataTypeOperator(field.dataType, filterName);

            if (operator.exp) {
                filterValue = operator.exp.replace('{expression}', filterValue);
            }

            if (!filterString) {
                filterString = `ga:${k}${operator.operator}${filterValue}`;
            } else {
                filterString += `;ga:${k}${operator.operator}${filterValue}`;
            }
        });

        return filterString;
    }

    private _cacheData(dateRange?: IDateRange[],  filters?: string, options?: IGetDataOptions, filterGroupungs?: string[]): Promise<IBatchProperties> {
        const firstDateRange = dateRange && dateRange[0];

        const startDate = moment(firstDateRange.from).format('YYYY-MM-DD');
        const endDate = moment(firstDateRange.to).format('YYYY-MM-DD');

        // get the groupings
        // options groupings have precedence over kpi groupings
        let groupings = options.groupings  && options.groupings.length  && options.groupings  ||
                          this._kpi.groupings && this._kpi.groupings.length && this._kpi.groupings.map(g => g.value) ||
                          [];

        if (filterGroupungs) {
            groupings = groupings.concat(filterGroupungs);
        }

        // groupings = [...groupings, ...filterGroupungs];

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
                                                filters,
                                                groupings);
                    });
    }
}