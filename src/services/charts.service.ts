import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { difference } from 'lodash';

import { getGroupingMetadata } from '../app_modules/charts/queries/chart-grouping-map';
import { IChartMetadata } from '../app_modules/charts/queries/charts/chart-metadata';
import {
    attachToDashboards,
    detachFromAllDashboards,
    detachFromDashboards,
} from '../app_modules/dashboards/mutations/common';
import { CurrentUser } from '../domain/app/current-user';
import { Logger } from '../domain/app/logger';
import { ChartAttributesInput } from './../app_modules/charts/charts.types';
import { ChartFactory } from './../app_modules/charts/queries/charts/chart-factory';
import { IUIChart } from './../app_modules/charts/queries/charts/ui-chart-base';
import { DateRangeHelper } from './../app_modules/date-ranges/queries/date-range.helper';
import { IKpiBase } from './../app_modules/kpis/queries/kpi-base';
import { KpiFactory } from './../app_modules/kpis/queries/kpi.factory';
import { IChart, IChartInput } from './../domain/app/charts/chart';
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
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(Targets.name) private _targets: Targets,
        @inject(TargetService.name) private _targetService: TargetService,
        @inject(CurrentUser.name) private _currentUser: CurrentUser,
        @inject(ChartFactory.name) private _chartFactory: ChartFactory,
        @inject(KpiFactory.name) private _kpiFactory: KpiFactory,
        @inject(Logger.name) private _logger: Logger
    ) { }

    public getChartsWithoutDefinition(criteria?: { }): Promise<IChart[]> {
        const that = this;
        return new Promise<IChart[]>((resolve, reject) => {
            that._charts.model
            .find()
            .then(chartDocuments => {
                resolve(chartDocuments.map(d => <IChart>d.toObject()));
                return;
            })
            .catch(err => {
                return reject(err);
            });
        });
    }

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

    public getChart(id: string, input: IChartInput, chart?: any): Promise<IChart> {
        // in order for this query to make sense I need either a chart definition or an id
        if (!chart && !id && !input) {
            return Promise.reject('An id or a chart definition is needed');
        }

        let chartPromise = chart ?
                Promise.resolve(<IChart>chart)
                : this.getChartById(id);

        const that = this;
        if (id && (typeof id === 'string')) {
            if (!input) {
                (<any>input) = {};
                (<any>input).chartId = id;
            } else {
                (<any>input).chartId = id;
            }
        }
        return new Promise<IChart>((resolve, reject) => {
            chartPromise.then(chart => {
                that.renderDefinition(chart, input).then(definition => {
                    chart.chartDefinition = definition;
                    resolve(chart);
                    return;
                });
            })
            .catch(err => {
                that._logger.error(err);
                reject(err);
            });
        });

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

    public createChart(input: IChartInput): Promise<IChart> {
        const that = this;
        return new Promise<IChart>((resolve, reject) => {
            that._kpis.model.find({ _id: { $in: input.kpis }})
            .then((kpis) => {
                if (!kpis || kpis.length !== input.kpis.length) {
                    that._logger.error('one or more kpi not found');
                    reject({ field: 'dashboards', errors: ['one or more kpis not found']});
                    return;
                }

                // resolve dashboards to include the chart
                that._dashboards.model.find( {_id: { $in: input.dashboards }})
                .then((dashboards) => {
                    const inputDashboards = input.dashboards || [];
                    if (!dashboards || dashboards.length !== inputDashboards.length) {
                        that._logger.error('one or more dashboard not found');
                        reject({ field: 'dashboards', errors: ['one or more dashboards not found'] });
                        return;
                    }

                    // create the chart
                    that._charts.model.createChart(input)
                    .then((chart) => {
                        attachToDashboards(that._dashboards.model, input.dashboards, chart._id)
                        .then(() => {
                            resolve(chart);
                            return;
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }

    public deleteChart(id: string): Promise<IChart> {
        const that = this;
        return new Promise<IChart>((resolve, reject) => {
            if (!id ) {
                return reject({ field: 'id', errors: ['Chart not found']});
            }

            that._charts.model.findOne({ _id: id})
            .exec()
            .then((chart) => {
                if (!chart) {
                    reject({ field: 'id', errors: ['Chart not found']});
                    return;
                }

                detachFromAllDashboards(that._dashboards.model, chart._id)
                .then(() => {
                    chart.remove().then(() =>  {
                        resolve(<IChart>chart.toObject());
                        return;
                    });
                })
                .catch(err => reject(err));
            });
        });
    }

    public updateChart(id: string, input: IChartInput): Promise<IChart> {
        const that = this;
        return new Promise<IChart>((resolve, reject) => {
            // resolve kpis
            that._kpis
                .model
                .find({ _id: { $in: input.kpis }})
                .then((kpis) => {
                if (!kpis || kpis.length !== input.kpis.length) {
                    that._logger.error('one or more kpi not found:' + id);
                    reject({ field: 'kpis', errors: ['one or more kpis not found']});
                    return;
                }

                // resolve dashboards the chart is in
                that._dashboards.model.find( {charts: { $in: [id]}})
                    .then((chartDashboards) => {
                        // update the chart
                        that._charts.model.updateChart(id, input)
                            .then((chart) => {
                                const currentDashboardIds = chartDashboards.map(d => String(d._id));
                                const toRemoveDashboardIds = difference(currentDashboardIds, input.dashboards);
                                const toAddDashboardIds = difference(input.dashboards, currentDashboardIds);

                                detachFromDashboards(that._dashboards.model, toRemoveDashboardIds, chart._id)
                                .then(() => {
                                    attachToDashboards(that._dashboards.model, toAddDashboardIds, chart._id)
                                    .then(() => {
                                        resolve(chart);
                                        return;
                                    })
                                    .catch(err => reject({ field: 'dashboard', errors: ['could not attach chart to dashboard']}));
                                })
                                .catch(err => reject({ field: 'dashboard', errors: ['could not detach chart from dashboard']}));
                            })
                            .catch(err => reject({ field: 'chart', errors: ['could not update chart']}));
                    })
                    .catch(err => reject({ field: 'dashboard', errors: ['could get the dashboard list']}));
                })
                .catch(err => reject({ field: 'kpi', errors: ['could get the kpi list']}));
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
            that._targetService.getTargets(chartId, that._currentUser.get()._id)
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
                    })
                    .catch(e => {
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