import { cloneDeep } from 'lodash';
import * as moment from 'moment';

import { GoogleAnalytics } from '../../../domain/app/google-analytics/google-analytics.model';
import { IKPI, IKPIDocument, IKPISimpleDefinition, KPITypeEnum } from '../../../domain/app/kpis/kpi';
import { IVirtualSourceDocument } from '../../../domain/app/virtual-sources/virtual-source';
import { IDateRange } from '../../../domain/common/date-range';
import { GoogleAnalyticsKPIService } from '../../../services/kpis/google-analytics-kpi/google-analytics-kpi.service';
import { KPIExpressionHelper } from './../../../domain/app/kpis/kpi-expression.helper';
import { IBatchProperties } from './../../../services/kpis/google-analytics-kpi/google-analytics.helper';
import { AggregateStage } from './aggregate';
import { IGetDataOptions, IKpiBase, IKpiVirtualSources } from './kpi-base';
import { SimpleKPIBase } from './simple-kpi-base';
import { GAJobsQueueService } from '../../../services/queues/ga-jobs-queue.service';
import { CurrentAccount } from '../../../domain/master/current-account';

export class GoogleAnalyticsKpi extends SimpleKPIBase implements IKpiBase {

    // private _deserializedFilter = {};

    public static CreateFromExpression( kpi: IKPIDocument,
                                        googleAnalytics: GoogleAnalytics,
                                        googleAnalyticsKpiService: GoogleAnalyticsKPIService,
                                        queueService: GAJobsQueueService,
                                        currentAccount: CurrentAccount,
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
        // kpiDefinition.dataSource = kpiDefinition.dataSource.replace('$', '');
        // const gaVirtualSource = virtualSources.find(vs => vs.name === 'google_analytics');
        const dsTokens = kpiDefinition.dataSource.split('$');
        let gaVirtualSource = virtualSources.find(vs => vs.name === dsTokens[0]);


        // to mantain compatibility, if virtualsource not found lets try to get it by static string. ( Old Method )
        if (!gaVirtualSource) {
            gaVirtualSource = virtualSources.find(vs => vs.name === 'google_analytics');
        }

        const kpiVirtualSources: IKpiVirtualSources = {
            virtualSource: gaVirtualSource
        };

        return new GoogleAnalyticsKpi(
            googleAnalytics.model,
            aggregateSkeleton,
            kpiDefinition,
            kpi,
            // googleAnalyticsKpiService,
            queueService,
            currentAccount,
            kpiVirtualSources);
    }

    private _virtualSource: IVirtualSourceDocument;

    private constructor(model: any,
                        private _baseAggregate: any,
                        private _definition: IKPISimpleDefinition,
                        private _kpi: IKPI,
                        // private _googleAnalyticsKpiService: GoogleAnalyticsKPIService,
                        private _queueService: GAJobsQueueService,
                        private _currentAccount: CurrentAccount,
                        kpiVirtualSources: IKpiVirtualSources) {
        super(model, _baseAggregate, kpiVirtualSources);

        this._virtualSource = kpiVirtualSources.virtualSource;

        if (!this._virtualSource) {
            const errStr = 'Virtual source for google analytics not found... ';
            console.log(errStr);
            throw new Error(errStr);
        }

        // this.collection = { modelName: 'GoogleAnalytics', timestampField: 'date' };
        this.collection = {
            modelName: this._virtualSource.modelIdentifier,
            timestampField: this._virtualSource.dateField
        };

        this._injectFieldToProjection(_definition.field);
        this._injectAcumulatorFunctionAndArgs(_definition);
   }

    async getData(dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any> {
        // the way to deal with and cases for google analytics its a little bit different
        if (this._kpi.filter) {
            let andOptions = this._kpi.filter['__dollar__and'];

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

        // the batch contains the view timezone
        const batch = await this._cacheData(dateRange, preparedFilters, options, filterGroupings);
        this.timezone = batch.viewTimezone;

        this._injectPreGroupStageFilters({ _batchId: batch._batchId }, this._definition.field);
        this.pristineAggregate = cloneDeep(this._baseAggregate);
        return this.executeQuery(this.collection.timestampField, dateRange, options);
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

    private async _cacheData(dateRange?: IDateRange[],  filters?: string, options?: IGetDataOptions, filterGroupings?: string[]): Promise<IBatchProperties> {
        // get the groupings
        // options groupings have precedence over kpi groupings
        let groupings = options.groupings  && options.groupings.length  && options.groupings  ||
                          this._kpi.groupings && this._kpi.groupings.length && this._kpi.groupings.map(g => g.value) ||
                          [];

        if (filterGroupings) {
            groupings = groupings.concat(filterGroupings);
        }

        // queue GA job
        const job = this._queueService.addGAJob(
            this._currentAccount.get.name,
            this._currentAccount.get.database.uri,
            this._definition.dataSource,
            dateRange,
            this._definition.field,
            options.frequency,
            filters,
            groupings);

        if (!job) {
            return Promise.reject('no job created for this ga request');
        }

        return new Promise<IBatchProperties>((resolve, reject) => {
            job.on('complete', function(result) {
                console.log('Job completed with data ', result);
                const j = job;
                resolve(result);
            }).on('failed', function(errorMessage) {
                console.log('Job failed');
                reject(errorMessage);
            });
        });
    }
}