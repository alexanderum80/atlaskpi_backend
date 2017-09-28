import { ITargetDocument } from '../../../../models/app/targets/ITarget';
import { parsePredifinedDate } from '../../../../models/common/date-range';
import { IKPIDocument, IAppModels } from '../../../../models/app';
import { IKpiBase, IKPIResult } from '../../kpis/kpi-base';
import { IChart, IChartDocument } from '../../../../models/app/charts';
import { IChartDateRange } from '../../../../models/common/date-range';
import { ChartPreProcessorExtention } from './chart-preprocessor-extention';
import { FrequencyHelper, IFrequencyInfo, IFrequencyValues } from './frequency-values';
import { IChartMetadata, IChartSerie, ChartType } from '.';
import {
    FREQUENCY_GROUPING_NAME,
    FrequencyEnum,
    getFrequencyPropName,
    getFrequencySequence,
    IDateRange,
} from '../../../../models/common';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as logger from 'winston';
import 'datejs';


import { ChartPostProcessingExtention } from './chart-postprocessing-extention';

interface Dictionary<T> { [key: string]: T; }

export interface IXAxisCategory {
    id: string | number;
    name: string;
}

// export interface IXAxisConfig {
//     fieldName: string;
//     categories: IXAxisCategory[];
// }

export interface IUIChart {
    getDefinition?(kpiBase: IKpiBase, metadata?: IChartMetadata, target?: ITargetDocument[]): Promise<any>;
}

export class UIChartBase {
    protected data: any[];
    protected dateRange: IChartDateRange;
    protected groupings: string[];
    protected categories: IXAxisCategory[];
    protected series: any[];
    protected targets: any;

    targetData: any[];
    commonField: any[];

    chartPreProcessor: ChartPreProcessorExtention;

    constructor(protected chart: IChart, protected frequencyHelper: FrequencyHelper) {
        if (!chart.kpis || chart.kpis.length < 1) {
            throw 'A chart cannot be created without a KPI';
        }
    }

    /**
     * Process the chart data decomposing it into the most relevant parts to build the chart definition
     * @param kpi kpi to run
     * @param metadata chart metadata
     */
    protected processChartData(kpi: IKpiBase, metadata?: IChartMetadata, target?: ITargetDocument[]): Promise < void > {
        logger.debug('processChartData for: ' + this.constructor.name + ' - kpi: ' + kpi.constructor.name);
        const that = this;

        this.dateRange = this._getDateRange(metadata.dateRange);

        return that.getKPIData(kpi, metadata).then(data => {
            logger.debug('data received, for chart: ' + this.constructor.name + ' - kpi: ' + kpi.constructor.name);
            that.data = data;

            that.groupings = that._getGroupingFields(data);

            this._formatTarget(target, metadata, that.groupings);

            that.frequencyHelper.decomposeFrequencyInfo(data, metadata.frequency);

            // xAxisSource name can be empty when there is only one grouping
            // in that case we choose that one
            if (!metadata.xAxisSource) {
                metadata.xAxisSource = that.groupings[0];
            }

            that.categories = that._createCategories(data, metadata);
            that.series = that._createSeries(data, metadata, that.categories, that.groupings);

            that._injectTargets(that.targetData, metadata, that.categories, that.groupings, that.series);

            return;
        }).catch(e => e );
    }

    /**
     * Put together all pieces of information to generate the chart definition
     * @param customOptions extra chart definition options
     */
    protected buildDefinition(customOptions: any, targetList: any): string {
        let definition = Object.assign({}, customOptions, this.chart.chartDefinition);
        let chartInfo = this.chart;
        let shortDateFormat = 'MM/DD/YY';
        const dateRange = this.dateRange || this.chart.dateRange;

        let dateRangeText = (<any>dateRange).predefined ?
            (<any>dateRange).predefined
            : moment(dateRange.custom[0].from).utc().format(shortDateFormat) + ' - ' + moment(dateRange.custom[0].to).utc().format(shortDateFormat);

        definition.title = { text: `${this.chart.title} (${dateRangeText})` };
        definition.subtitle = { text: this.chart.subtitle };

        definition.series = this.series;
        this.chart.targetList = targetList;

        if (!definition.xAxis) {
            definition.xAxis = {};
        }

        definition.xAxis.categories = this.categories ? this.categories.map(c => c.name) : [];

        return definition;
    }

    /**
     * Retrieve kpi data
     * @param kpi kpi to run
     * @param dateRange date range
     * @param metadata chart metadata
     */
    protected getKPIData(kpi: IKpiBase, metadata?: IChartMetadata): Promise<any[]> {
        logger.debug('trying to get kpi data for: ' + this.chart.title);
        // const dateRange = this.dateRange ? this. dateRange.custom : null;
        return kpi.getData((<any>this.dateRange).custom, metadata);
    }

    /**
     * Returns the data range to be used for the chart
     * @param metadataDateRange data range that includes a predefined or a custom data range
     */
    private _getDateRange(metadataDateRange: IChartDateRange[]): IChartDateRange {
        let dateRange: IDateRange;

        return {
            predefined: (metadataDateRange && metadataDateRange.length) ? metadataDateRange[0].predefined : this.chart.dateRange[0].predefined,
            custom: metadataDateRange ?
                this._processChartDateRange(metadataDateRange)
                : this._processChartDateRange(this.chart.dateRange)
        };
    }

    /**
     * Understand how to convert a chart data range interface into a simple date range
     * @param chartDateRange data range that includes a predefined or a custom data range
     */
    private _processChartDateRange(chartDateRange: IChartDateRange[]): IDateRange {
        return (<any>chartDateRange).map((dateRange) => {
            return dateRange.custom && dateRange.custom.from ?
                { from: new Date(dateRange.custom.from), to: new Date(dateRange.custom.to) }
                : parsePredifinedDate(dateRange.predefined);
        });
    }

    /**
     * Return all field names used for grouping the results
     * @param data raw data
     */
    private _getGroupingFields(data): string[] {
        if (!data) {
            return [];
        }

        return Object.keys(data[0]._id);
    }

    /**
     * Generate the list of categories for the chart
     * @param data raw data
     * @param metadata chart metadata
     */
    private _createCategories(data: any, metadata: IChartMetadata): IXAxisCategory[] {
        if (metadata.xAxisSource === 'frequency') {
           return this.frequencyHelper.getCategories(metadata.frequency);
        }

        const uniqueCategories = <string[]> _.uniq(data.map(item => item._id[metadata.xAxisSource]));

        return uniqueCategories.map(category => {
            return {
                id: category,
                name: category
            };
        });
    }

    /**
     * Generate the chart serie(s) based on the parameters
     * @param data raw data
     * @param categories chart categories
     * @param extra chart metadata
     * @param groupings list of fields used to group the data
     */
    private _createSeries(data: any[], meta: IChartMetadata, categories: IXAxisCategory[], groupings: string[]): any[] {
        if (!data) {
            console.log('you have to call getData() before getting the series');
            return null;
        }

        /**
         *  Not all charts come with frequency so the processing may be a little different
         *  when frequency is present I need to group the results by year
         *  we have a couple of ways to deal with the generation of the series and it depends mainly
         *  on how many groupings exist
         *  1- level grouping: all
         *  2- level grouping: line, column, bar
         *  3- level grouping: stacked columns, stacked bar
         */


        /*
         *  At this point I already know which field is going to be used for the xAxis
         *  so I need to get a list of the rest of the grouping fields so I can build the series
         */

        const availableGroupingsForSeries = _.difference(groupings, [meta.xAxisSource]);


        if (availableGroupingsForSeries.length === 0) {

            /**
             *  this is a one level grouping chart
             */
            return this._getSeriesForFirstLevelGrouping(data, categories, meta.xAxisSource);


        } else if (availableGroupingsForSeries.length === 1) {

            /**
             *  this is a two level grouping chart
             */
            return this._getSeriesForSecondLevelGrouping(data, meta, categories, availableGroupingsForSeries[0]);


        } else if (availableGroupingsForSeries.length === 2) {

            /**
             *  this is a three level grouping chart
             */
            // this._getSeriesForThirdLevelGrouping(data, meta, categories, groupings);

        }
    }


    private _getSeriesForFirstLevelGrouping(data: any[], categories: IXAxisCategory[], group: string): IChartSerie[] {

        if (this.chart.chartDefinition.chart.type === ChartType.Pie) {
            return [{
                showInLegend: false,
                name: '',
                data:  categories.map(cat => {
                    let dataItem = _.find(data, (item: any) => {
                        return item._id[group] === cat.id;
                    });

                    return {
                        name: cat.name || 'Others',
                        y: dataItem ? dataItem.value : null
                    };
                })
            }];
        } else {
            return [{
                name: '',
                data: data.map(item => item.value)
            }];
        }
    }

    private _getSeriesForSecondLevelGrouping(data: any[], meta: IChartMetadata, categories: IXAxisCategory[], groupByField: string): IChartSerie[] {

        /**
         * First I need to group the results using the next groupig field
         */
        let groupedData: Dictionary<any> = _.groupBy(data, '_id.' + groupByField);

        let series: IChartSerie[] = [];
        let matchField: string;

        if (meta.xAxisSource === FREQUENCY_GROUPING_NAME) {
            matchField = getFrequencyPropName(meta.frequency);
        } else {
            matchField = meta.xAxisSource;
        }

        return this._createSeriesFromgroupedData(groupedData, categories, matchField);
    }

    private _createSeriesFromgroupedData(groupedData: Dictionary<any>, categories: IXAxisCategory[], matchField: string): IChartSerie[] {
        let series: IChartSerie[] = [];

        for (let serieName in groupedData) {
            let serie: IChartSerie = {
                name: (serieName || 'Other'),
                data: []
            };

            categories.forEach(cat => {
                let dataItem = _.find(groupedData[serieName], (item: any) => {
                    return item._id[matchField] === cat.id;
                });

                serie.data.push( dataItem ? dataItem.value : null );
            });

            series.push(serie);
        }

        return series;
    }

    private _formatTarget(target: any[], metadata: any, groupings: any) {
        this.commonField = _.filter(groupings, (v, k) => {
            return v !== 'frequency';
        });

        if (target.length) {
            let filterTarget = target.filter((val) => {
                return val.active !== false;
            });

            this.targetData = _.map(filterTarget, (v, k) => {
                return (<any>v).stackName ? {
                    _id: {
                        frequency: moment(v.datepicker).format('YYYY-MM'),
                        [this.commonField[0]]: (<any>v).name,
                        stackName: (<any>v).stackName,
                        targetId: v._id
                    },
                    value: (<any>v).target,
                    targetId: v._id
                } : {
                    _id: {
                        frequency: moment(v.datepicker).format('YYYY-MM'),
                        [this.commonField[0]]: (<any>v).name,
                        targetId: v._id
                    },
                    value: (<any>v).target,
                    targetId: v._id
                };
            });
            this.frequencyHelper.decomposeFrequencyInfo(this.targetData, metadata.frequency);
        }
    }

    private _injectTargets(data: any[], meta: IChartMetadata, categories: IXAxisCategory[], groupings: string[], series: any[]) {
        let groupDifference = _.difference(groupings, [meta.xAxisSource]);
        this.targets = this._targetGrouping(data, groupDifference.length, groupDifference[0], meta, categories);

        if (this.targets) {
            this.targets.forEach((target) => {
                series.push(target);
            });
        }
    }

    private _targetGrouping(data: any[], length: number, groupings: string, meta: IChartMetadata, categories: IXAxisCategory[]): any {
        switch (length) {
            case 0:
                return [{
                    name: '',
                    data: data.map(item => item.value)
                }];
            case 1:
                return this._targetMetaData(meta, groupings, data, categories);
        }
    }

    private _targetMetaData(meta: any, groupByField: any, data: any[], categories: IXAxisCategory[]) {
        let groupedData: Dictionary<any> = _.groupBy(data, (val) => {
            if (val['_id'].hasOwnProperty('stackName')) {
                return val._id[groupByField] + '_' + val._id['stackName'];
            }
            return val._id[groupByField];
        });

        let series: IChartSerie[] = [];
        let matchField: string;

        if (meta.xAxisSource === FREQUENCY_GROUPING_NAME) {
            matchField = getFrequencyPropName(meta.frequency);
        } else {
            matchField = meta.xAxisSource;
        }

        return this._targetFormatData(groupedData, categories, matchField);
    }

    private _targetFormatData(groupedData: Dictionary<any>, categories: IXAxisCategory[], matchField: string) {
        let series: IChartSerie[] = [];
        // adds spline and targetId to series
        // use targetId for edit/delete
        for (let serieName in groupedData) {
            let serie: IChartSerie = {
                name: (serieName.match(/_[a-z]+/i)) ?
                        ( serieName.replace(serieName, serieName.match(/[^_a-z]+/i)[0]) ) :
                        (serieName || 'Other'),
                data: []
            };

            serie['type'] = 'spline';
            serie['targetId'] = groupedData[serieName][0].targetId;

            categories.forEach(cat => {
                let dataItem = _.find(groupedData[serieName], (item: any) => {
                    if (item._id.hasOwnProperty('stackName') && item._id.stackName) {
                        return item._id.stackName === cat.id;
                    }
                    return item._id[matchField] === cat.id;
                });

                serie.data.push( dataItem ? dataItem.value : null );
            });

            series.push(serie);
        }
        return series;
    }

}