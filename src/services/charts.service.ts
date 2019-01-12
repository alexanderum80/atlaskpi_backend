import { camelCase } from 'change-case';
import { inject, injectable } from 'inversify';
import {difference, isNumber, isString, pick, PartialDeep, cloneDeep, isEmpty, isArray, omit, uniq }  from 'lodash';
import * as moment from 'moment-timezone';
import * as Bluebird from 'bluebird';

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
import {
    convertStringDateRangeToDateDateRange,
    IChartDateRange,
    IDateRange,
    PredefinedDateRanges,
    PredefinedTargetPeriod,
    processDateRangeWithTimezone,
} from './../domain/common/date-range';
import {FrequencyEnum, FrequencyTable} from './../domain/common/frequency-enum';
import { TargetService } from './target.service';
import {dataSortDesc} from '../helpers/number.helpers';
import { TargetsNew } from '../domain/app/targetsNew/target.model';
import { ChartDateRangeInput } from '../app_modules/shared/shared.types';
import { IKPI } from '../domain/app/kpis/kpi';

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
    onTheFly: boolean;
}


@injectable()
export class ChartsService {

    constructor(
        @inject(Charts.name) private _charts: Charts,
        @inject(Dashboards.name) private _dashboards: Dashboards,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(TargetsNew.name) private _targets: TargetsNew,
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
                throw new Error('chart info is missing');
            }

            const definitions = chart.kpis.map(async k => {
                if (!k.kpi) { return null; }

                const c = cloneDeep(chart);
                c.chartDefinition.chart.type = k.type;
                c.chartDefinition.chart.kpi = k.kpi.name;

                c.kpis = [k];

                const uiChart = this._chartFactory.getInstance(c);
                const groupings = this._prepareGroupings(c, options);
                const kpi = await this._kpiFactory.getInstance(c.kpis[0].kpi);

                const meta: IChartMetadata = {
                    filter: options && options.filter || c.filter,
                    frequency: FrequencyTable[options && options.frequency || c.frequency],
                    groupings: groupings,
                    comparison: options && options.comparison || c.comparison,
                    xAxisSource: options && options.xAxisSource || c.xAxisSource,
                    dateRange: (options && !options.isFutureTarget && options.dateRange) || c.dateRange || null,
                    top: (options && options.top) || c.top,
                    isDrillDown: options && options.isDrillDown || false,
                    isFutureTarget: options && options.isFutureTarget || false,
                    sortingCriteria: c.sortingCriteria,
                    sortingOrder: c.sortingOrder,
                    originalFrequency: (options && options.originalFrequency) ? FrequencyTable[options.originalFrequency] : -1,
                    onTheFly: (options ? options.onTheFly : false),
                };

                chart.targetExtraPeriodOptions = this._getTargetExtraPeriodOptions(meta.frequency, chart.dateRange);
                chart.canAddTarget = this._canAddTarget(meta.dateRange);

                // lets fill the comparison options for this chart if only if its not a comparison chart already
                const isComparisonChart = !c.comparison || !c.comparison.length;
                if (isComparisonChart) {
                    c.availableComparison = DateRangeHelper.getComparisonItemsForDateRangeIdentifier(c.dateRange[0].predefined || 'custom')
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
            });

            return Promise.all(definitions).then(res => this._mergeDefinitions(res));
            // return this._mergeDefinitions(definitions);

        } catch (e) {
            console.error('There was an error rendering chart definition', e);
            return null;
        }
    }

    async getChart(chart: any): Promise<IChart>;
    async getChart(id: string, input?: IChartInput): Promise<IChart>;
    async getChart(idOrChart: string, input?: IChartInput): Promise<IChart> {
        try {
            // in order for this query to make sense I need either a chart definition or an id
            if (!idOrChart && !input) {
                throw new Error('An id or a chart definition is needed');
            }

            input = input || {} as any;
            let chart = !isString(idOrChart)
                ? idOrChart : await this.getChartById(idOrChart);

            if (typeof idOrChart === 'string') {
                (<any>input).chartId = idOrChart;
            }

            if (input && input.dateRange) {
                // update dateRange, frequency, grouping, isDrillDown
                // use case: change daterange and frequency in chart view of dashboard
                const chartOptions: PartialDeep<IChartInput> = pick(input,
                            ['dateRange', 'frequency', 'groupings', 'isDrillDown', 'xAxisSource', 'comparison']
                );
                Object.assign(chart, chartOptions);
            }

            const definition = await this.renderDefinition(chart, input as any);
            // chart.chartDefinition = definition;
            const originalDefinitionSeries = cloneDeep(chart.chartDefinition.series);

            chart.chartDefinition = this._setSeriesVisibility(originalDefinitionSeries, definition);
            chart.chartDefinition = this._addSerieColorToDefinition(originalDefinitionSeries, definition);

            return chart;
        } catch (e) {
            this._logger.error(e);
            throw e;
        }
    }

    public async getChartById(id: string): Promise<IChart> {
        try {
            const chart = await this._charts.model
                .findOne({ _id: id })
                .populate({ path: 'kpis.kpi' })
                .lean()
                .exec() as IChart;

            if (!chart) {
                throw { field: 'id', errors: ['Chart not found']};
            }

            // const kpis = await this._kpis.model.find({ _id: chart.kpis.map(k => k.kpi) }).lean().exec() as IKPI[];
            // // attach kpis to chart document
            // chart.kpis.forEach(k => {
            //     k.kpi = kpis.find(kpiDoc => kpiDoc._id.toString() === k.kpi);
            // });

            const dashboards = await this._resolveDashboards(chart);
            // const chart: any = chartDocument.toObject();
            chart.dashboards = dashboards;

            return chart;
        } catch (e) {
            throw e;
        }
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
            // const kpi = await this._kpis.model.findOne({ _id: input.kpis[0]});
            const chart = <any>{ ... input };
            const parseDefinition = JSON.parse(input.chartDefinition);
            const originalDefinitionSeries = cloneDeep(parseDefinition.series);

            chart.chartDefinition = parseDefinition;

            const kpis = await this._kpis.model.find({ _id: { $in: input.kpis.map(k => k.kpi) } });
            chart.kpis.forEach(ik => {
                ik.kpi = kpis.find(k => k.id === ik.kpi);
            });

            const definition = await this.renderDefinition(chart);

            chart.chartDefinition = this._setSeriesVisibility(originalDefinitionSeries, definition);
            chart.chartDefinition = this._addSerieColorToDefinition(originalDefinitionSeries, definition);

            return chart;
        } catch (e) {
            this._logger.error('There was an error previewing a chart', e);
            return null;
        }
    }

    public async createChart(input: IChartInput): Promise<IChart> {
        try {
            const kpis = await this._kpis.model.find({ _id: { $in: input.kpis.map(k => k.kpi) }});

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

            // IMPORTANT!!! transform date from string to date based on user timezone.
            const tz = this._currentUser.get().profile.timezone;
            input.dateRange  = input.dateRange.map(d => convertStringDateRangeToDateDateRange(d, tz) as any);

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

                        // IMPORTANT!!!: transform date from string to date based on user timezone.
                        const tz = this._currentUser.get().profile.timezone;
                        input.dateRange  = input.dateRange.map(d => convertStringDateRangeToDateDateRange(d, tz) as any);

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

    private async _renderRegularDefinition(   chartId: string,
                                        kpi: IKpiBase,
                                        uiChart: IUIChart,
                                        meta: IChartMetadata ): Promise<any> {
        try {
            const userId = (!this._currentUser || !this._currentUser.get()) ? '' : this._currentUser.get()._id;
            const res = meta.onTheFly ? [] : await this._targetService.getTargets(chartId, userId);

            return uiChart.getDefinition(kpi, { ...meta }, res);
        } catch (e) {
            this._logger.error(e);
            return null;
        }
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
        return processDateRangeWithTimezone(dateRange[0], this._currentUser.get().profile.timezone);
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
        if (!dateRange) { return false; }
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

        if (findDateRange.predefined === 'all times') {
            const isDateInFuture = moment().isAfter(moment().format('YYYY'));
            return isDateInFuture;
        }

        return true;
    }

    private _setSeriesVisibility(chartSeries, chartData) {
        if (!chartData || !chartData.chart) {
            return chartData;
        }

        const chartSeriesExist: boolean = Array.isArray(chartSeries);
        if (!chartData) return chartData;
        if (chartData.chart.type !== 'pie') {
            if (chartSeriesExist) {
                chartSeries.map(s => {
                    if (s && s.visible !== undefined) {
                        let serieDefinition = (chartData.series) ? chartData.series.find(f => f.name === s.name) : null;
                        if (serieDefinition) {
                            if (serieDefinition) {
                                serieDefinition.visible = s.visible;
                            }
                        }
                    }
                });
            }
        }
        else {
            const chartSeriesDataExist: boolean = isArray(chartSeries) &&
                                         !isEmpty(chartSeries) &&
                                         isArray(chartSeries[0].data);

            if (chartSeriesDataExist) {
                chartSeries[0].data.map(s => {
                    if (s && s.visible !== undefined) {
                        const isChartDataSeriesDataExist: boolean = !isEmpty(chartData) &&
                                                isArray(chartData.series) &&
                                                !isEmpty(chartData.series[0]) &&
                                                isArray(chartData.series[0].data);

                        if (isChartDataSeriesDataExist) {
                            const serieDefinition = (chartData.series) ? chartData.series[0].data.find(c => c.name === s.name) : null;
                            if (serieDefinition) {
                                serieDefinition.visible = s.visible;
                            }
                        }
                    }
                });
            }
        }

        return chartData;
    }
    private _addSerieColorToDefinition(definitionSeries, chartData) {
        if (!chartData || !chartData.chart) {
            return chartData;
        }

        if (chartData.chart.type === 'pie') {
            // check if data exist in definitionSeries[0]
            const definitionSeriesDataExist: boolean = Array.isArray(definitionSeries) &&
                                                       !isEmpty(definitionSeries) &&
                                                       Array.isArray(definitionSeries[0].data);

            if (definitionSeriesDataExist) {
                definitionSeries[0].data.map(d => {
                    if (!isEmpty(d) && !isEmpty(d.color)) {
                        const serieData = (chartData.series) ? chartData.series[0].data.find(c => c.name === d.name) : null;
                        // update the color on the new chart only
                        if (serieData) {
                            serieData.color = d.color;
                        }
                    }
                });
            }
        } else {
            const canMapDefinitionSeries: boolean = Array.isArray(definitionSeries) && definitionSeries.length > 0;

            if (canMapDefinitionSeries) {
                definitionSeries.map(d => {
                    if (!isEmpty(d) && !isEmpty(d.color)) {
                        const serieData = chartData.series ? chartData.series.find(c => c.name === d.name) : null;
                        // update the color on new chart only
                        if (serieData) {
                            serieData.color = d.color;
                        }
                    }
                });
            }
        }
        return chartData;
    }

    private _mergeDefinitions(definitions: any[]) {
        console.log(definitions);

        if (definitions.length === 1) { return definitions[0]; }

        // pick one definition as master
        const def = cloneDeep(definitions[0]);

        // get unique list of categories
        def.xAxis.categories = uniq([].concat(...definitions.map(d => d.xAxis.categories)));

        // combined serie names with empty data array to cover the category array
        def.series = [].concat(...definitions.map(d => d.series.map(s => ({
            name: s.name,
            kpiName: d.chart.kpi,
            type: d.chart.type,
            data: new Array(def.xAxis.categories.length)
        }))));

        def.xAxis.categories.forEach((c, idx) => {
            definitions.forEach(d => {
                d.series.forEach(s => {
                    // get final chart serie
                    const finalSerie = def.series.find(ser => ser.name === s.name);
                    // get category index for this chart definition so can put the value in the
                    // right index in the final chart
                    const categoryIndex = d.xAxis.categories.findIndex(cat => cat === c);

                    if (categoryIndex !== -1 && s) {
                        // put the category value in the right index
                        finalSerie.data[idx] = s.data[categoryIndex];
                    }
                });
            });
        });

        // add kpi name to series
        def.series.forEach(s => {
            s.name += ` [${s.kpiName}]`;
            delete(s.kpiName);
        });

        return def;
    }
}