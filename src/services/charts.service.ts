import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { getGroupingMetadata } from '../app_modules/charts/queries/chart-grouping-map';
import { IChartMetadata } from '../app_modules/charts/queries/charts/chart-metadata';
import { CurrentUser } from '../domain/app/current-user';
import { Logger } from '../domain/app/logger';
import { ChartAttributesInput } from './../app_modules/charts/charts.types';
import { ChartFactory } from './../app_modules/charts/queries/charts/chart-factory';
import { IUIChart } from './../app_modules/charts/queries/charts/ui-chart-base';
import { DateRangeHelper } from './../app_modules/date-ranges/queries/date-range.helper';
import { IKpiBase } from './../app_modules/kpis/queries/kpi-base';
import { KpiFactory } from './../app_modules/kpis/queries/kpi.factory';
import { IChart } from './../domain/app/charts/chart';
import { Charts } from './../domain/app/charts/chart.model';
import { IDashboardDocument } from './../domain/app/dashboards/dashboard';
import { Dashboards } from './../domain/app/dashboards/dashboard.model';
import { KPIs } from './../domain/app/kpis/kpi.model';
import { Targets } from './../domain/app/targets/target.model';
import { IChartDateRange } from './../domain/common/date-range';
import { FrequencyTable } from './../domain/common/frequency-enum';
import { TargetService } from './target.service';

export interface IRenderChartOptions {
    chartId?: string;
    dateRange?: [IChartDateRange];
    filter?: string;
    frequency?: string;
    groupings?: string[];
    comparison?: string[];
    xAxisSource?: string;
    isFutureTarget?: boolean;
    isDrillDown?: boolean;
}

@injectable()
export class ChartsService {

    constructor(
        @inject(Charts.name) private _charts: Charts,
        @inject(Dashboards.name) private _dashboards: Dashboards,
        @inject('KPIs') private _kpis: KPIs,
        @inject(Targets.name) private _targets: Targets,
        @inject(TargetService.name) private _targetService: TargetService,
        @inject('CurrentUser') private _currentUser: CurrentUser,
        @inject(ChartFactory.name) private _chartFactory: ChartFactory,
        @inject(KpiFactory.name) private _kpiFactory: KpiFactory,
        @inject('Logger') private _logger: Logger
    ) { }

    public renderDefinition(chart: IChart, options?: IRenderChartOptions): Promise<any> {
        if (!chart) {
            return Promise.reject('missing parameter');
        }

        const uiChart = this._chartFactory.getInstance(chart);
        const kpi = this._kpiFactory.getInstance(chart.kpis[0]);

        const meta: IChartMetadata = {
            filter: options && options.filter || chart.filter,
            frequency: FrequencyTable[options && options.frequency || chart.frequency],
            groupings: getGroupingMetadata(chart, options && options.groupings || []),
            comparison: options && options.comparison || chart.comparison,
            xAxisSource: options && options.xAxisSource,
            dateRange: (options && !options.isFutureTarget && options.dateRange) || null,
            isDrillDown: options && options.isDrillDown || false,
            isFutureTarget: options && options.isFutureTarget || false,
        };

        // lets fill the comparison options for this chart if only if its not a comparison chart already
        const isComparisonChart = !chart.comparison || !chart.comparison.length;
        if (isComparisonChart) {
            chart.availableComparison = DateRangeHelper.getComparisonItemsForDateRangeIdentifier(chart.dateRange[0].predefined || 'custom')
                                                        .map(item => item.key);
        }

        if (!meta.isDrillDown && options && options.chartId) {
            return this._renderRegularDefinition(options.chartId, kpi, uiChart, meta);
        }

        return this._renderPreviewDefinition(kpi, uiChart, meta);
    }

    public getChartById(id: string): Promise<IChart> {
        const that = this;

        return new Promise<IChart>((resolve, reject) => {
            this._charts.model
                .findOne({ _id: id })
                .populate({
                    path: 'kpis',
                }).then(chartDocument => {
                    that._resolveDashboards(chartDocument).then((dashboards) => {
                        const chart: any = chartDocument.toObject();
                        chart.dashboards = dashboards;
                        chart.availableComparison = DateRangeHelper.getComparisonItemsForDateRangeString(chart.dateRange[0].predefined || 'custom')
                                                                    .map(item => item.key);
                        resolve(chart);
                        return;
                    });
                })
                .catch(e => reject(e));
        });
    }

    public listCharts(): Promise<IChart[]> {
        const that = this;
        return new Promise<IChart[]>((resolve, reject) => {
            that._charts.model
            .find({})
            .then(chartDocuments => {
                return resolve(chartDocuments);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }

    public previewChart(input: ChartAttributesInput): Promise<IChart> {
        const that = this;
        return new Promise<IChart>((resolve, reject) => {
            that._kpis.model.findOne({ _id: input.kpis[0]})
                .then(kpi => {
                    const chart = <any>{ ... input };
                    chart.chartDefinition = JSON.parse(input.chartDefinition);
                    chart.kpis[0] = kpi;
                    that.renderDefinition(chart)
                        .then(definition => {
                            chart.chartDefinition = definition;
                            resolve(chart);
                            return;
                        })
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    private _resolveDashboards(chart): Promise<IDashboardDocument[]> {
        const that = this;
        return new Promise<IDashboardDocument[]>((resolve, reject) => {
            that._dashboards.model.find( { charts: { $in: [chart._id] }}).exec()
                .then((dashboards) => resolve(dashboards))
                .catch(err => reject(err));
        });
    }

    private _renderRegularDefinition(   chartId: string,
                                        kpi: IKpiBase,
                                        uiChart: IUIChart,
                                        meta: IChartMetadata ): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            that._targetService.getTargets(chartId, (<any>that._currentUser.get)._id)
                .then((res) => {
                    if (meta.isFutureTarget &&
                        meta.frequency !== FrequencyTable.yearly) {
                        meta.dateRange = meta.dateRange ||
                            [{ predefined: null,
                                custom: TargetService.futureTargets(res) }];
                    }

                    uiChart.getDefinition(kpi, { ...meta }, res).then((definition) => {
                        that._logger.debug('chart definition received for id: ' + chartId);
                        resolve(definition);
                        return;
                    }).catch(e => {
                        that._logger.error(e);
                        reject(e);
                        return;
                    });
                })
                .catch(err => {
                    that._logger.error(err);
                    reject(err);
                });
        });
    }

    private _renderPreviewDefinition(   kpi: IKpiBase,
                                        uiChart: IUIChart,
                                        meta: IChartMetadata): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            uiChart.getDefinition(kpi, { ...meta }, []).then((definition) => {
                that._logger.debug('chart definition received for a preview');
                resolve(definition);
                return;
            }).catch(e => {
                that._logger.error(e);
                reject(e);
                return;
            });
        });
    }
}