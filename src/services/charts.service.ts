import { camelCase } from 'change-case';
import { inject, injectable } from 'inversify';
import {difference, isNumber, isString, pick, PartialDeep, orderBy, isEmpty, omit }  from 'lodash';
import * as moment from 'moment';

import { IChartMetadata } from '../app_modules/charts/queries/charts/chart-metadata';
import {
    attachToDashboards,
    detachFromAllDashboards,
    detachFromDashboards,
} from '../app_modules/dashboards/mutations/common';
import { IObject } from '../app_modules/shared/criteria.plugin';
import { CurrentUser } from '../domain/app/current-user';
import { Logger } from '../domain/app/logger';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import {chartTopLimit, IChartTop, isNestedArray} from '../domain/common/top-n-record';
import {ChartAttributesInput} from './../app_modules/charts/charts.types';
import { ChartFactory } from './../app_modules/charts/queries/charts/chart-factory';
import { IUIChart, NULL_CATEGORY_REPLACEMENT } from './../app_modules/charts/queries/charts/ui-chart-base';
import { DateRangeHelper } from './../app_modules/date-ranges/queries/date-range.helper';
import { IKpiBase } from './../app_modules/kpis/queries/kpi-base';
import { KpiFactory } from './../app_modules/kpis/queries/kpi.factory';
import { IChart, IChartInput } from './../domain/app/charts/chart';
import { Charts } from './../domain/app/charts/chart.model';
import { IDashboardDocument } from './../domain/app/dashboards/dashboard';
import { Dashboards } from './../domain/app/dashboards/dashboard.model';
import { KPIs } from './../domain/app/kpis/kpi.model';
import { Targets } from './../domain/app/targets/target.model';
import {IChartDateRange, IDateRange, parsePredifinedDate, PredefinedTargetPeriod, PredefinedDateRanges} from './../domain/common/date-range';
import {FrequencyEnum, FrequencyTable} from './../domain/common/frequency-enum';
import { TargetService } from './target.service';
import {dataSortDesc} from '../helpers/number.helpers';

export interface IRenderChartOptions {
    chartId?: string;
    dateRange?: [IChartDateRange];
    top?: IChartTop;
    filter?: string;
    frequency?: string;
    groupings?: string[];
    comparison?: string[];
    xAxisSource?: string;
    isFutureTarget?: boolean;
    isDrillDown?: boolean;
    originalFrequency?: string;
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
        @inject(Logger.name) private _logger: Logger,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources
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

    async renderDefinition(chart: IChart, options?: IRenderChartOptions): Promise<any> {
        try {
            if (!chart) {
                throw new Error('missing parameter');
            }

            const virtualSources = await this._virtualSources.model.find({});
            const uiChart = this._chartFactory.getInstance(chart);
            const groupings = this._prepareGroupings(chart, options);
            const kpi = await this._kpiFactory.getInstance(chart.kpis[0]);

            const meta: IChartMetadata = {
                filter: options && options.filter || chart.filter,
                frequency: FrequencyTable[options && options.frequency || chart.frequency],
                groupings: groupings,
                comparison: options && options.comparison || chart.comparison,
                xAxisSource: options && options.xAxisSource || chart.xAxisSource,
                dateRange: (options && !options.isFutureTarget && options.dateRange) || chart.dateRange || null,
                top: (options && options.top) || chart.top,
                isDrillDown: options && options.isDrillDown || false,
                isFutureTarget: options && options.isFutureTarget || false,
                sortingCriteria: chart.sortingCriteria,
                sortingOrder: chart.sortingOrder,
                originalFrequency: (options && options.originalFrequency) ? FrequencyTable[options.originalFrequency] : -1
            };

            chart.targetExtraPeriodOptions = this._getTargetExtraPeriodOptions(meta.frequency, chart.dateRange);
            chart.canAddTarget = this._canAddTarget(meta.dateRange);

            // lets fill the comparison options for this chart if only if its not a comparison chart already
            const isComparisonChart = !chart.comparison || !chart.comparison.length;
            if (isComparisonChart) {
                chart.availableComparison = DateRangeHelper.getComparisonItemsForDateRangeIdentifier(chart.dateRange[0].predefined || 'custom')
                                                            .map(item => item.key);
            }

            // get top n if have necessary data
            if (meta.groupings &&
                meta.groupings.length &&
                meta.top &&
                (meta.top.predefined || meta.top.custom)) {
                    const topNData: any[] = await this._getTopByGrouping(meta, kpi);

                    const groupByField: string = camelCase(meta.groupings[0]);
                    const checkTopGroupings = topNData.map(d => d._id[groupByField] || NULL_CATEGORY_REPLACEMENT);

                    meta.includeTopGroupingValues = topNData.map(d => {
                        return d._id[groupByField] ||
                              (
                                  isNestedArray(checkTopGroupings) ?
                                  [NULL_CATEGORY_REPLACEMENT] : NULL_CATEGORY_REPLACEMENT
                              );
                    });

                    if (!meta.isDrillDown && options && options.chartId) {
                        return this._renderRegularDefinition(options.chartId, kpi, uiChart, meta);
                    }

                    return this._renderPreviewDefinition(kpi, uiChart, meta);
            } else {
                if (!meta.isDrillDown && options && options.chartId) {
                    return this._renderRegularDefinition(options.chartId, kpi, uiChart, meta);
                }

                return this._renderPreviewDefinition(kpi, uiChart, meta);
            }
        } catch (e) {
            console.error('There was an error rendering chart definition', e);
            return null;
        }
    }

    public getChart(chart: any): Promise<IChart>;
    public getChart(id: string, input?: IChartInput): Promise<IChart>;
    public getChart(idOrChart: string, input?: IChartInput): Promise<IChart> {
        // in order for this query to make sense I need either a chart definition or an id
        if (!idOrChart && !input) {
            return Promise.reject('An id or a chart definition is needed');
        }

        let chart = null;

        if (!isString(idOrChart)) {
            chart = idOrChart;
        }

        let chartPromise = chart ?
                Promise.resolve(<IChart>chart)
                : this.getChartById(idOrChart);

        const that = this;
        if (idOrChart && (typeof idOrChart === 'string')) {
            if (!input) {
                (<any>input) = {};
                (<any>input).chartId = idOrChart;
            } else {
                (<any>input).chartId = idOrChart;
            }
        }
        return new Promise<IChart>((resolve, reject) => {
            chartPromise.then(chart => {
                if (input && input.dateRange) {
                    // update dateRange, frequency, grouping, isDrillDown
                    // use case: change daterange and frequency in chart view of dashboard
                    const chartOptions: PartialDeep<IChartInput> = pick(input,
                                ['dateRange', 'frequency', 'groupings', 'isDrillDown', 'xAxisSource', 'comparison']
                    );
                    Object.assign(chart, chartOptions);
                }

                that.renderDefinition(chart, input).then(definition => {
                    chart.chartDefinition = this._addSerieColorToDefinition(chart.chartDefinition.series, definition);
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

    public getChartByTitle(title: string): Promise<IChart> {
        const that = this;
        return new Promise<IChart>((resolve, reject) => {
            that._charts.model
            .findOne({ title: title })
            .then(chart => {
                return resolve(chart);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }

    public async previewChart(input: ChartAttributesInput): Promise<IChart> {
        try {
            const kpi = await this._kpis.model.findOne({ _id: input.kpis[0]});
            const chart = <any>{ ... input };

            chart.chartDefinition = JSON.parse(input.chartDefinition);
            chart.kpis[0] = kpi;
            const definition = await this.renderDefinition(chart);
            chart.chartDefinition = this._addSerieColorToDefinition(chart.chartDefinition.series, definition);

            return chart;
        } catch (e) {
            this._logger.error('There was an error previewing a chart', e);
            return null;
        }
    }

    public async createChart(input: IChartInput): Promise<IChart> {
        try {
            const kpis = await this._kpis.model.find({ _id: { $in: input.kpis }});

            if (!kpis || kpis.length !== input.kpis.length) {
                this._logger.error('one or more kpi not found');
                throw new Error('one or more kpis not found');
            }
            // resolve dashboards to include the chart
            const dashboards = await this._dashboards.model.find( {_id: { $in: input.dashboards }});
            const inputDashboards = input.dashboards || [];

            if (!dashboards || dashboards.length !== inputDashboards.length) {
                this._logger.error('one or more dashboard not found');
                throw new Error('one or more dashboards not found');
            }
            // create the chart
            const chart = await this._charts.model.createChart(input);
            await attachToDashboards(this._dashboards.model, input.dashboards, chart._id);

            return chart;
        } catch (e) {
            this._logger.error('There was an error creating a chart', e);
            return null;
        }
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

    private _prepareGroupings(chart: IChart, options: IRenderChartOptions): string[] {
        const groupings = [];
        const extraGroupings = options && options.groupings ? options.groupings : [];

        if (chart && chart.groupings && chart.groupings.length) {
            chart.groupings.forEach(g => {
                if (g) {
                    groupings.push(g);
                }
            });
        }

        if (extraGroupings && extraGroupings.length) {
            extraGroupings.forEach(g => {
                if (g) {
                    groupings.push(g);
                }
            });
        }

        return groupings;
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
            const userId = (!that._currentUser || !that._currentUser.get()) ? '' : that._currentUser.get()._id;

            that._targetService.getTargets(chartId, userId)
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

    /**
     * when have groupings and daterange
     * get top n with the limit
     * @param meta
     * @param kpi
     */
    private async _getTopByGrouping(meta: IChartMetadata, kpi: IKpiBase): Promise<any[]> {
        const top: IChartTop = meta.top;
        // i.e. 5, 10, 8, 2
        let limit: number = chartTopLimit(top);

        const dateRange: IDateRange[] = [this._getTopDateRange(meta.dateRange)];

        const options = pick(meta, ['groupings', 'dateRange']);
        const groupings: string[] = options.groupings;

        const data = await kpi.getData(dateRange, options);
        if (!isNumber(limit) || limit === 0) {
            return data;
        }

        const sortedData: any[] = data.sort(dataSortDesc);

        if (limit !== 1 && (groupings || groupings.length)) {
            limit = limit - 1;
        }
        return sortedData.slice(0, limit);
    }

    private _getTopDateRange(dateRange: IChartDateRange[]): IDateRange {
        return dateRange[0].custom && dateRange[0].custom.from ?
                {
                    from: moment(dateRange[0].custom.from).startOf('day').toDate(),
                    to: moment(dateRange[0].custom.to).endOf('day').toDate()
                }
                : parsePredifinedDate(dateRange[0].predefined);
    }

    private _getTargetExtraPeriodOptions(frequency: number, chartDateRange?: IChartDateRange[]): IObject {
        if (!isNumber(frequency) && !isEmpty(chartDateRange)) {
            return this._noFrequencyTargetExtraOptions(chartDateRange);
        }

        switch (frequency) {
            case FrequencyEnum.Daily:
                return PredefinedTargetPeriod.daily;
            case FrequencyEnum.Weekly:
                return PredefinedTargetPeriod.weekly;
            case FrequencyEnum.Monthly:
                return PredefinedTargetPeriod.monthly;
            case FrequencyEnum.Quarterly:
                return PredefinedTargetPeriod.quarterly;
            case FrequencyEnum.Yearly:
                return PredefinedTargetPeriod.yearly;
        }
    }

    private _noFrequencyTargetExtraOptions(chartDateRange: IChartDateRange[]): IObject {
        const predefinedDateRange: string = chartDateRange[0].predefined;
        const samePeriodLast: string[] = ['samePeriodLastYear', 'samePeriod2YearsAgo'];

        switch (predefinedDateRange) {
            case PredefinedDateRanges.thisYear:
            case PredefinedDateRanges.thisYearToDate:
                return omit(PredefinedTargetPeriod.monthly, samePeriodLast);

            case PredefinedDateRanges.custom:
                return PredefinedTargetPeriod.custom;

            case PredefinedDateRanges.thisQuarter:
            case PredefinedDateRanges.thisQuarterToDate:
                return omit(PredefinedTargetPeriod.quarterly, samePeriodLast);

            case PredefinedDateRanges.thisMonth:
            case PredefinedDateRanges.thisMonthToDate:
                return omit(PredefinedTargetPeriod.monthly, samePeriodLast);

            case PredefinedDateRanges.thisWeek:
            case PredefinedDateRanges.thisWeekToDate:
                return omit(PredefinedTargetPeriod.weekly, samePeriodLast);
            default:
                return {};

        }
    }

    private _canAddTarget(dateRange: IChartDateRange[]): boolean {
        const findDateRange: IChartDateRange = dateRange.find((d: any) => d.predefined);
        if (!findDateRange) {
            return true;
        }

        if (findDateRange.predefined.match(/last/i)) {
            return false;
        }

        if (findDateRange.predefined === 'custom') {
            const isDateInFuture = moment(findDateRange.custom.to).isAfter(moment());
            return isDateInFuture;
        }
        return true;
    }

    private _addSerieColorToDefinition(definitionSeries, chartData) {
        if (chartData.chart.type === 'pie') {
            definitionSeries[0].data.map(d => {
                if (d.color && d.color !== '') {
                    const serieData = chartData.series[0].data.find(c => c.name === d.name);
                    if (serieData) {
                        serieData.color = d.color;
                    }
                }
            });
        } else {
            definitionSeries.map(d => {
                if (d.color && d.color !== '') {
                    const serieData = chartData.series.find(c => c.name === d.name);
                    if (serieData) {
                        serieData.color = d.color;
                    }
                }
            });
        }
        return chartData;
    }

}