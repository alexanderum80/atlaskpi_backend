import { parsePredifinedDate } from '../../../../models/common/date-range';
import { IKPIDocument, IAppModels } from '../../../../models/app';
import { getKPI } from '../../kpis/kpi.factory';
import { IKpiBase, IKPIResult } from '../../kpis/kpi-base';
import { IChart, IChartDateRange, IChartDocument } from '../../../../models/app/charts';
import { ChartPreProcessorExtention } from './chart-preprocessor-extention';
import { IFrequencyValues, FrequencyHelper } from './frequency-values';
import { IChartMetadata, IChartSerie } from '.';
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
    getDefinition?(kpiBase: IKpiBase, dateRange: IDateRange, metadata?: IChartMetadata): Promise<string>;
}

export abstract class UIChartBase implements IUIChart {
    protected series: any[];
    protected categories: any[];

    protected grouping: string;
    protected data: any[];

    chartPreProcessor: ChartPreProcessorExtention;

    constructor(protected chart: IChart, protected frequencyHelper: FrequencyHelper) {
        if (!chart.kpis || chart.kpis.length < 1) {
            throw 'A chart cannot be created without a KPI';
        }
    }

    protected getDefinitionBase(kpi: IKpiBase, metadata?: IChartMetadata): Promise < string > {
        const that = this;

        return that.getKPIData(kpi, metadata).then(data => {
            let groupings = that._getGroupingFields(data);
            that.frequencyHelper.extractFrequency(data, metadata.frequency);

            let categories = that._createCategories(data, metadata);
            let series = that._createSeries(data, metadata, categories, groupings);

            // TODO: pending when we deal with second level groupings
            // that.groupings = this.getGroupings(data);
            return JSON.stringify({categories: categories.map(c => c.name), series: series});
        });
    }

    /**
     * Retrieve kpi data
     * @param kpi kpi to run
     * @param dateRange date range
     * @param metadata chart metadata
     */
    protected getKPIData(kpi: IKpiBase, metadata?: IChartMetadata): Promise<any[]> {
        const dateRange = this._getDateRange(metadata.dateRange);
        return kpi.getData(dateRange, metadata.frequency, metadata.grouping);
    }

    /**
     * Returns the data range to be used for the chart
     * @param metadataDateRange data range that includes a predefined or a custom data range
     */
    private _getDateRange(metadataDateRange: IChartDateRange): IDateRange {
        let dateRange: IDateRange;

        return metadataDateRange ?
            this._processChartDateRange(metadataDateRange)
            : this._processChartDateRange(this.chart.dateRange);
    }

    /**
     * Understand how to convert a chart data range interface into a simple date range
     * @param chartDateRange data range that includes a predefined or a custom data range
     */
    private _processChartDateRange(chartDateRange: IChartDateRange): IDateRange {
        return chartDateRange.custom ?
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
            return this._getSeriesForFirstLevelGrouping(data, '');


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




        // if (groupings.indexOf(FREQUENCY_GROUPING_NAME)) {

        //     /*
        //     *  then I get the frequency property name based on the the selected frequency because that
        //     *  property is used to save the frequency info once the data is received from mongo as numeric values(year, month, day, etc)
        //     */
        //     let frequencyName = getFrequencyPropName(meta.frequency);

        //     /*
        //     *  first of we need to group the result set by year because in a chart we are not showing more than a year at a time
        //     */
        //     let dataGroupedByYear = _.groupBy(data, FREQUENCY_GROUPING_NAME + '.year');

        //     /**
        //      *  here I create series by year
        //      */
        //     let series: IChartSerie[] = this.frequencyHelper.get().years.map(y => {
        //         return {
        //             name: y,
        //             data: dataGroupedByYear[y].map(item => [item.frequency[frequencyName], item.value])
        //         };
        //     });

        // }

        // /*
        //  *  frequency data may not be completed and we need to make sure that we
        //  *  complete the sequence. Ex: months, days of the months, quarters, etc
        //  */
        // let freqSequence = getFrequencySequence(meta.frequency);

        // /**
        //  *  once I have a complete sequence for the frequency I go over the series's data
        //  *  I complete the empty frequency slots if any
        //  */
        // if (freqSequence) {
        //     for (let i = 0; i < series.length; i++) {
        //         let completed = freqSequence.map(freq => {
        //             let dataValue = series[i].data.find(dataItem => freq === dataItem[0]);
        //             return dataValue ? dataValue[1] : null;
        //         });

        //         series[i].data = completed;
        //     }
        // }

        // return series;
    }


    private _getSeriesForFirstLevelGrouping(data: any[], name: string): IChartSerie[] {
        return [{
            name: name,
            data: data.map(item => item.value)
        }];
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
                name: serieName,
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
}