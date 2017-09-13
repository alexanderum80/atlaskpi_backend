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

            that.commonField = _.filter(that.groupings, (v, k) => {
                return v !== 'frequency';
            });

            // // checks if target array is empty
            if (target.length) {
                let count = 0;
                that.targetData = _.map(target, (v, k) => {
                    count = count + 1;
                    return (<any>v).stackName ? {
                        _id: {
                            frequency: moment(v.datepicker).format('YYYY-MM'),
                            [that.commonField[0]]: 'Target Stack ' + count,
                            stackName: (<any>v).stackName,
                            targetId: v._id
                        },
                        value: (<any>v).target,
                        targetId: v._id
                    } : {
                        _id: {
                            frequency: moment(v.datepicker).format('YYYY-MM'),
                            [that.commonField[0]]: 'Target ' + count,
                            targetId: v._id
                        },
                        value: (<any>v).target,
                        targetId: v._id
                    };
                });
                that.targetData.forEach((val) => {
                    that.data.push(val);
                });
            }

            that.frequencyHelper.decomposeFrequencyInfo(data, metadata.frequency);

            // xAxisSource name can be empty when there is only one grouping
            // in that case we choose that one
            if (!metadata.xAxisSource) {
                metadata.xAxisSource = that.groupings[0];
            }

            that.categories = that._createCategories(data, metadata);
            that.series = that._createSeries(data, metadata, that.categories, that.groupings);

            return;
        }).catch(e => e );
    }

    /**
     * Put together all pieces of information to generate the chart definition
     * @param customOptions extra chart definition options
     */
    protected buildDefinition(customOptions: any): string {
        let definition = Object.assign({}, customOptions, this.chart.chartDefinition);
        let chartInfo = this.chart;
        let shortDateFormat = 'MM/DD/YY';
        const dateRange = this.dateRange || this.chart.dateRange;

        let dateRangeText = dateRange.predefined ?
            dateRange.predefined
            : moment(dateRange.custom.from).format(shortDateFormat) + ' - ' + moment(dateRange.custom.to).format(shortDateFormat);

        definition.title = { text: `${this.chart.title} (${dateRangeText})` };
        definition.subtitle = { text: this.chart.subtitle };

        definition.series = this.series;

        if (!definition.xAxis) {
            definition.xAxis = {};
        }

        definition.xAxis.categories = this.categories ? this.categories.map(c => c.name) : [];
        // if (definition.hasOwnProperty('xAxis') && definition.xAxis.hasOwnProperty('categories')) {
        //     definition.xAxis.categories = definition.xAxis.categories.filter((val) => {
        //         return (val !== null) && (!val.match(/stack/i));
        //     });
        // }

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
        return kpi.getData(this.dateRange.custom, metadata);
    }

    /**
     * Returns the data range to be used for the chart
     * @param metadataDateRange data range that includes a predefined or a custom data range
     */
    private _getDateRange(metadataDateRange: IChartDateRange): IChartDateRange {
        let dateRange: IDateRange;

        return {
            predefined: metadataDateRange ? metadataDateRange.predefined : this.chart.dateRange.predefined,
            custom: metadataDateRange ?
                this._processChartDateRange(metadataDateRange)
                : this._processChartDateRange(this.chart.dateRange)
        };
    }

    /**
     * Understand how to convert a chart data range interface into a simple date range
     * @param chartDateRange data range that includes a predefined or a custom data range
     */
    private _processChartDateRange(chartDateRange: IChartDateRange): IDateRange {
        return chartDateRange.custom && chartDateRange.custom.from ?
            { from: new Date(chartDateRange.custom.from), to: new Date(chartDateRange.custom.to) }
            : parsePredifinedDate(chartDateRange.predefined);
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
        // let groupedData: Dictionary<any> = _.groupBy(data, '_id.' + groupByField);
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

        return this._createSeriesFromgroupedData(groupedData, categories, matchField);
    }

    private _createSeriesFromgroupedData(groupedData: Dictionary<any>, categories: IXAxisCategory[], matchField: string): IChartSerie[] {
        let series: IChartSerie[] = [];

        for (let serieName in groupedData) {
            let serie: IChartSerie = {
                name: (serieName.match(/_[a-z]+/i)) ?
                        ( serieName.replace(serieName, serieName.match(/[^_a-z]+/i)[0]) ) :
                        (serieName || 'Other'),
                data: []
            };
            // adds spline and targetId to series
            // use targetId for edit/delete
            if (groupedData[serieName][0].hasOwnProperty('targetId')) {
                serie['type'] = 'spline';
                serie['targetId'] = groupedData[serieName][0].targetId;
            }

            categories.forEach(cat => {
                let dataItem = _.find(groupedData[serieName], (item: any) => {
                    if (item._id.hasOwnProperty('stackName') && item._id.stackName) {
                        // when it is a stacked column, move value in data array to correct xAxis category
                        // if category is in first index, value in moved to the first index of the data array
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

    private _stackCategories(definition) {
        return definition.xAxis.categories.search('Target') === -1;
    }

    private _isStacked(definition: any, chart: any) {
        return chart.hasOwnProperty('xAxisSource') ? ((definition.chart.type === 'column') &&
        (chart.groupings[0] === chart.xAxisSource)) : false;
    }
}