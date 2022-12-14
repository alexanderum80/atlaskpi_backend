import * as Bluebird from 'bluebird';
import * as console from 'console';
import {
    sumBy, cloneDeep, difference, flatten, groupBy,
    isEmpty, isNull, isUndefined, map, union, uniq,
    uniqBy, orderBy, isNumber, isString, sortBy} from 'lodash';
import * as moment from 'moment';
import * as logger from 'winston';
import { camelCase } from 'change-case';
import { IChart } from '../../../../domain/app/charts/chart';
import {
    getDateRangeIdFromString,
    IChartDateRange,
    IDateRange,
    parseComparisonDateRange,
    parsePredefinedDate,
    PredefinedComparisonDateRanges,
    PredefinedDateRanges,
    processDateRangeWithTimezone,
} from '../../../../domain/common/date-range';
import {
    FREQUENCY_GROUPING_NAME,
    FrequencyEnum,
    getFrequencyPropName,
    getFrequencySequence,
} from '../../../../domain/common/frequency-enum';
import { TargetService } from '../../../../services/target.service';
import { IKpiBase } from '../../../kpis/queries/kpi-base';
import { IChartMetadata } from './chart-metadata';
import { ChartPreProcessorExtention } from './chart-preprocessor-extention';
import { IChartSerie } from './chart-serie';
import { ChartType } from './chart-type';
import { FrequencyHelper } from './frequency-values';
import {ApplyTopNChart} from './apply-top-n.chart';
import { ITargetNewDocument } from '../../../../domain/app/targetsNew/target';

export const NULL_CATEGORY_REPLACEMENT = 'Uncategorized*';

interface Dictionary<T> { [key: string]: T; }

export interface IXAxisCategory {
    id: string | number;
    name: string;
}

export interface IShowCustomDateRange {
    regular: boolean;
    comparison: boolean;
}

export interface IComparisonSerieObject {
    name?: string;
    data?: string[];
    type?: string;
    stack?: string;
    targetId?: string;
    percentageCompletion?: number;
    comparisonString?: string;
    category?: string;
}

export interface ICategoriesWithValues {
    category?: string;
    serieName?: string;
    serieValue?: number|object;
    type?: string;
    targetId?: any;
    percentageCompletion?: number;
}

export interface IComparsionDefObjectData {
    // i.e main: ICategoriesWithValues
    // i.e lastYear: ICategoriesWithValues
    [key: string]: ICategoriesWithValues[];
}

export interface IComparsionDefObject {
    data?: IComparsionDefObjectData;
    uniqCategories?: string[];
}
export enum SortingCriteriaEnum {
    Values = 'values',
    Frequency = 'frequency',
    Categories = 'categories',
    Groupings = 'groupingAlphabetically',
    Totals = 'valuesTotal',
    TotalsMain = 'valuesTotalMain',
    TotalsPrevious = 'valuesTotalPrevious'
 }

 export enum SortingOrderEnum {
    Ascending = 'ascending',
    Descending = 'descending'
 }

export interface IUIChart {
    getDefinition?(kpiBase: IKpiBase, metadata?: IChartMetadata, target?: ITargetNewDocument[]): Promise<any>;
}

export class UIChartBase {
    protected basicDefinition: any;
    protected data: any[];
    protected dateRange: IChartDateRange[];
    protected groupings: string[];
    protected sortingCriteria: string;
    protected sortingOrder: string;
    protected categories: IXAxisCategory[];
    protected series: any[];
    protected targets: any;
    protected drilldown: boolean;
    protected futureTarget: boolean;
    protected comparison: IDateRange[];

    targetData: any[];
    commonField: any[];
    isCustomDateRange: IShowCustomDateRange = {
        regular: false,
        comparison: false
    };

    chartPreProcessor: ChartPreProcessorExtention;

    constructor(protected chart: IChart, protected frequencyHelper: FrequencyHelper,
                protected tz: string)  {
        if (!chart.kpis || chart.kpis.length < 1) {
            throw 'A chart cannot be created without a KPI';
        }
    }

    /**
     * Process the chart data decomposing it into the most relevant parts to build the chart definition
     * @param kpi kpi to run
     * @param metadata chart metadata
     */
    protected processChartData(kpi: IKpiBase, metadata?: IChartMetadata, target?: ITargetNewDocument[]): Promise < void > {
        // logger.debug('processChartData for: ' + this.constructor.name + ' - kpi: ' + kpi.constructor.name);
        const that = this;

        if (metadata.dateRange &&
            Array.isArray(metadata.dateRange) &&
            metadata.dateRange[0].predefined === 'custom') {
            this.isCustomDateRange.regular = true;
        }

        this.dateRange = this._getDateRange(metadata.dateRange);
        this.drilldown = metadata.isDrillDown;
        this.futureTarget = metadata.isFutureTarget;
        this.sortingCriteria = metadata.sortingCriteria;
        this.sortingOrder = metadata.sortingOrder;

        return that.getKPIData(kpi, metadata).then(data => {
            // logger.debug('data received, for chart: ' + this.constructor.name + ' - kpi: ' + kpi.constructor.name);
            that.data = data;

            if (!data || !data.length) {
                return;
            }

            metadata.xAxisSource = camelCase(metadata.xAxisSource);

            let groupingField = (metadata.groupings && metadata.groupings.length) ? camelCase(metadata.groupings[0]) : null;

            // must transform data first to apply top n
            // will return data if top n input is not given
            data = ApplyTopNChart.applyTopNToData(data, metadata);

            // sorting ?
            if (metadata.sortingCriteria && metadata.sortingOrder)
                data = this._sortingData(metadata, data);

            that.groupings = that._getGroupingFields(data);

            const isTargetPresent = target && target.length;

            if (isTargetPresent) {
                that._dummyData(data, metadata, target);
                that._formatTarget(target, metadata, that.groupings);
            }

            that.frequencyHelper.decomposeFrequencyInfo(data, metadata.frequency);

            // xAxisSource name can be empty when there is only one grouping
            // in that case we choose that one
            if (!metadata.xAxisSource) {
                metadata.xAxisSource = that.groupings[0];
            }

            that.categories = that._createCategories(data, metadata);
            that.series = that._createSeries(data, metadata, that.categories, that.groupings);

            that._injectTargets(that.targetData, metadata, that.categories, that.groupings, that.series);
            // console.log(JSON.stringify( that.series));

            return;
        }).catch(e => {
            logger.error(e);
        } );
    }

    /**
     * Put together all pieces of information to generate the chart definition
     * @param customOptions extra chart definition options
     */
    protected buildDefinition(customOptions: any, metadata: IChartMetadata, targetList: any): string {
        let definition = Object.assign({}, customOptions, this.chart.chartDefinition);
        let chartInfo = this.chart;
        let shortDateFormat = 'MM/DD/YY';
        const dateRange = this.dateRange || this.chart.dateRange;

        let dateRangeText;

        if (!this.drilldown) {
            dateRangeText = (<any>dateRange)[0].predefined ?
            (<any>dateRange)[0].predefined
            : moment(dateRange[0].custom.from).utc().format(shortDateFormat) + ' - ' + moment(dateRange[0].custom.to).utc().format(shortDateFormat);
        } else {
            dateRangeText = 'Drilldown';
        }

        dateRangeText = this.futureTarget ? 'Next Year' : dateRangeText;

        definition.title = { text: `${this.chart.title} (${dateRangeText})` };
        definition.subtitle = { text: this.chart.subtitle };
        definition.series = this.series;
        this.chart.targetList = targetList;
        this.chart.futureTarget = this.futureTarget;

        if (!definition.xAxis) {
            definition.xAxis = {};
        }

        this._formatCustomDateRangeWithData(this.categories, metadata, definition.series);
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
        // logger.debug('trying to get kpi data for: ' + this.chart.title);
        // const dateRange = this.dateRange ? this. dateRange.custom : null;
        const isDateRangeCustomEmpty = this.dateRange || this.dateRange.filter((range) => range.custom !== undefined);
        const dateRange = isDateRangeCustomEmpty.length ? this.dateRange.map((range) => range.custom) : [];
        return kpi.getData((<any>dateRange), metadata);
    }

    /**
     * Returns the data range to be used for the chart
     * @param metadataDateRange data range that includes a predefined or a custom data range
     */
    protected _getDateRange(metadataDateRange: IChartDateRange[]): IChartDateRange[] {
        return metadataDateRange ?
            metadataDateRange.map((dateRange) => {
                return {
                    predefined: dateRange.predefined,
                    custom: this._processChartDateRange(dateRange)
                };
            })
            : this.chart.dateRange.map((dateRange) => {
                return {
                    predefined: dateRange.predefined,
                    custom: this._processChartDateRange(dateRange)
                };
            });
    }

    /**
     * Understand how to convert a chart data range interface into a simple date range
     * @param chartDateRange data range that includes a predefined or a custom data range
     */
    private _sortingData(metadata: IChartMetadata, data: any): any {

        let groupingField = (metadata.groupings && metadata.groupings.length) ? camelCase(metadata.groupings[0]) : null;

        if (metadata.sortingCriteria && metadata.sortingCriteria === SortingCriteriaEnum.Values) {
            if (metadata.sortingOrder) data = orderBy( data , 'value', metadata.sortingOrder === SortingOrderEnum.Ascending ? 'asc' : 'desc');
        } else if (metadata.sortingCriteria && groupingField && data.find(e => e._id[groupingField] === metadata.sortingCriteria)) {
            // First of all filter the selected serie data
            let datafiltered = data.filter(x => x._id[groupingField] === metadata.sortingCriteria);
            // Now sorting per value
            if (metadata.sortingOrder) {
                datafiltered = orderBy( datafiltered , 'value', metadata.sortingOrder === SortingOrderEnum.Ascending ? 'asc' : 'desc');
            }

            // Here the data is sorted by value of the selected groupingField
            // NOW foreach datafiltered record, filtering the original data by frecuency
            // and adding in datasemifinal
            // finally assign the data again
            const datasemifinal = [];
            datafiltered.forEach(element => {
                let dataTemp = data.filter(x => x._id.frequency === element._id.frequency);
                dataTemp.forEach(z => { datasemifinal.push(z); });
            });
            data = datasemifinal;
        } else if (groupingField && metadata.sortingCriteria && (metadata.sortingCriteria === SortingCriteriaEnum.Categories || metadata.sortingCriteria === SortingCriteriaEnum.Groupings)) {
            if (this.sortingOrder) data = orderBy(data, '_id[' + groupingField + ']', metadata.sortingOrder === SortingOrderEnum.Ascending ? 'asc' : 'desc');
        }
        else if (!metadata.comparison && metadata.sortingCriteria && metadata.sortingCriteria === SortingCriteriaEnum.Totals) {
            let dataTemp = [];
            let dataSorted = [];
            // Here I most group by frequency,  then sum the values
            let groupedData1 = groupBy(data, '_id.frequency');
            for (let serieName in groupedData1) {
                dataTemp.push({
                    name: serieName,
                    totalValue: sumBy(groupedData1[serieName], 'value')
                });
            }

            if (metadata.sortingOrder) dataSorted = orderBy(dataTemp, 'totalValue', metadata.sortingOrder === SortingOrderEnum.Ascending ? 'asc' : 'desc');
            // Here is sorting by totalValue
            // forEach dataSorted, filter original data by frecuency & adding in new data
            // finally assign to data again
            const datasemifinal = [];
            dataSorted.forEach(element => {
                let datafilt = data.filter(x => x._id.frequency.toString() === element.name);
                datafilt.forEach(z => {
                    datasemifinal.push(z);
                });
            });
            data = datasemifinal;
        }
        return data;
    }

    private _processChartDateRange(chartDateRange: IChartDateRange ): IDateRange {
        return processDateRangeWithTimezone(chartDateRange, this.tz);
    }

    /**
     * Return all field names used for grouping the results
     * @param data raw data
     */
    private _getGroupingFields(data): string[] {
        if (!data || !data.length) {
            return [];
        }

        let values = data.slice(0, 20).map(d => uniq(Object.keys(d._id)));
        values = uniq(flatten(values));

        return values;
    }

    /**
     * Generate the list of categories for the chart
     * @param data raw data
     * @param metadata chart metadata
     */
    private _createCategories(data: any, metadata: IChartMetadata): IXAxisCategory[] {

        let groupingField = (metadata.groupings && metadata.groupings.length) ? camelCase(metadata.groupings[0]) : null;
        if (metadata.sortingCriteria) {
            if (metadata.sortingCriteria === SortingCriteriaEnum.Values && metadata.sortingOrder) {
                data = orderBy(data, 'value', metadata.sortingOrder === SortingOrderEnum.Ascending ? 'asc' : 'desc');
            } else if (groupingField && (metadata.sortingCriteria === SortingCriteriaEnum.Categories || metadata.sortingCriteria === SortingCriteriaEnum.Groupings) && metadata.sortingOrder && metadata.sortingOrder === SortingOrderEnum.Ascending) {
                data = orderBy(data, '_id[' + groupingField + ']', metadata.sortingOrder === SortingOrderEnum.Ascending ? 'asc' : 'desc');
            }
        }
        if (metadata.xAxisSource === 'frequency') {
            let categoryHelper;
            let noGrouping = !metadata.groupings || !metadata.groupings.length || !metadata.groupings[0];
            if (noGrouping && this.chart.chartDefinition.chart.type !== ChartType.Pie && metadata.frequency !== FrequencyEnum.Yearly) {
                let dateRange = metadata.dateRange || this.dateRange;
                categoryHelper = this._noGroupingsCategoryHelper(data, metadata , dateRange, metadata.frequency, metadata.sortingCriteria, metadata.sortingOrder);
                if (categoryHelper && categoryHelper.length && !metadata.top && !(metadata.top.predefined || metadata.top.custom)) {
                    return categoryHelper;
                }
            }
            return this.frequencyHelper.getCategories(data, metadata.frequency, noGrouping ? null : camelCase(metadata.groupings[0]), metadata.sortingCriteria , metadata.sortingOrder);
        }

        const xAxisSource: any = this._getXaxisSource(data, metadata);

        const uniqueCategories = <string[]> orderBy(uniq(data.map(item => {
            let val = JSON.stringify(item._id[xAxisSource]);
            if (isString(val)) {
                // remove double quotes
                val = val.replace(/['"]+/g, '');
            }
                return (val === 'null' || val === undefined || val.toLowerCase() === 'undefined' ) ?
                        NULL_CATEGORY_REPLACEMENT :
                        item._id[xAxisSource];
        })));

        return uniqueCategories.map(category => {
            return {
                id: category,
                name: category
            };
        });
    }

    private _getXaxisSource(data: any[], metadata: IChartMetadata, groupings?: string[]) {
        if (!metadata || !metadata.xAxisSource) { return ''; }

        if (!data || !data.length) { return metadata.xAxisSource; }
        if (metadata.xAxisSource === 'frequency' && groupings && groupings.length) { return groupings; }

        let findXaxisSource;
        let xAxisSource = '';
        findXaxisSource = data.filter(item => item._id[metadata.xAxisSource]);
        let obj = {
            index: -1,
            field: null
        };

        if (!findXaxisSource || !findXaxisSource.length) {
            let dataKeys = Object.keys(data[0]._id);
            if (!Array.isArray(dataKeys)) {
                dataKeys = [];
            }

            for (let i = 0; i < dataKeys.length; i++) {
                const findIndex = dataKeys[i].indexOf(metadata.xAxisSource);
                if (findIndex !== -1) {
                    obj = {
                        index: findIndex,
                        field: dataKeys[i]
                    };
                    break;
                }
            }
        }

        xAxisSource = (obj.index !== -1) ? obj.field : metadata.xAxisSource;

        if (groupings && groupings.length) {
            const frequency = groupings.filter(g => g === 'frequency');
            frequency.push(metadata.xAxisSource);
            return frequency;
        }
        return xAxisSource;
    }

    /**
     * this is used in _createCategories for last(2-5) years predefined range to duplicate categories
     * when groupings is selected and is by frequency
     * @param dateRange ichartdaterange, getting predefined property
     * @param frequency used for frequency enum value
     */

    private _noGroupingsCategoryHelper(data: any, metadata: any , dateRange: IChartDateRange[], frequency: number, sortingCriteria, sortingOrder): any[] {
        const predefined = dateRange[0].predefined;
        let duplicateCategories: any[] = [];
        let groupingField = (metadata.groupings && metadata.groupings.length) ? camelCase(metadata.groupings[0]) : null;
        let dateRangesMap = {};
        dateRangesMap[PredefinedDateRanges.last2Years] = 2;
        dateRangesMap[PredefinedDateRanges.last3Years] = 3;
        dateRangesMap[PredefinedDateRanges.last4Years] = 4;
        dateRangesMap[PredefinedDateRanges.last5Years] = 5;
        for (let i = 1; i <= dateRangesMap[predefined]; i++) {
            duplicateCategories.push(this.frequencyHelper.getCategories(data, frequency, groupingField , sortingCriteria, sortingOrder));
        }
        if (duplicateCategories.length) {
            duplicateCategories = flatten(duplicateCategories);
        }
        return duplicateCategories;
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

        const chartGroupings = this._getXaxisSource(data, meta, groupings);
        const availableGroupingsForSeries = difference(chartGroupings, [meta.xAxisSource]);


        if (availableGroupingsForSeries.length === 0) {

            /**
             *  this is a one level grouping chart
             */
            return this._getSeriesForFirstLevelGrouping(data, categories, meta);


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
    private _getSeriesForFirstLevelGrouping(data: any[], categories: IXAxisCategory[], meta: IChartMetadata): IChartSerie[] {
        let serieObject;
        if (this.chart.chartDefinition.chart.type === ChartType.Pie) {
            serieObject = {
                name: this.chart.kpis[0].kpi.name,
                data:  categories.map(cat => {
                    let dataItem = cat.id !== NULL_CATEGORY_REPLACEMENT
                               ? data.find((item: any) => item._id[meta.xAxisSource] === cat.id)
                               : data.find((item: any) => (item._id[meta.xAxisSource] === null || !Object.keys(item._id).length ));

                    return {
                        name: cat.name || NULL_CATEGORY_REPLACEMENT,
                        y: dataItem ? dataItem.value : null
                    };
                })
            };

         } else {
            serieObject = {
                name: this.chart.kpis[0].kpi.name,
                data: []
            };

            let matchField: any = getFrequencyPropName(meta.frequency);
            if (!matchField && data.length) {
                matchField = Object.keys(data[0]._id)[0] || NULL_CATEGORY_REPLACEMENT;
            }

            categories.forEach(cat => {
                let dataItem = cat.id !== NULL_CATEGORY_REPLACEMENT
                                ? data.find((item: any) => item._id[matchField] === cat.id)
                                : data.find((item: any) => (
                                    item._id[matchField] === null ||
                                    item._id[matchField] === NULL_CATEGORY_REPLACEMENT ||
                                    !Object.keys(item._id).length
                                ));

                const chartType = this.chart.chartDefinition.chart.type;
                if ((chartType === 'column' || chartType === 'bar') && dataItem && dataItem.value === 0) {
                    dataItem.value = null;
                }

                serieObject.data.push(dataItem ? dataItem.value : null);
            });
         }

        // When no groupings or frequency we have a single value
        // Highcharts need a category for displaying a value so we are going to use the kpi name
        if (serieObject.data.length === 1 && categories.length === 1 && categories[0].id === NULL_CATEGORY_REPLACEMENT) {
            this.categories[0].name = this.chart.kpis[0].kpi.name;
            if (this.chart.chartDefinition.chart.type === ChartType.Pie) {
                serieObject.data[0].name = this.chart.kpis[0].kpi.name;
            }
        }

        return [serieObject];
    }

    private _getSeriesForSecondLevelGrouping(data: any[], meta: IChartMetadata, categories: IXAxisCategory[], groupByField: string): IChartSerie[] {

        /**
         * First I need to group the results using the next groupig field
         */
        let groupedData: Dictionary<any> = groupBy(data, '_id.' + groupByField);

        let series: IChartSerie[] = [];
        let matchField: string;

        if (meta.xAxisSource === FREQUENCY_GROUPING_NAME && meta.frequency !== null) {
            matchField = getFrequencyPropName(meta.frequency);
        } else {
            matchField = camelCase(meta.groupings[0]);
        }

        return this._createSeriesFromgroupedData(groupedData, categories, matchField, meta.sortingCriteria, meta.sortingOrder);
    }

    private _createSeriesFromgroupedData(groupedData: Dictionary<any>, categories: IXAxisCategory[], matchField: string, sortingCriteria: string, sortingOrder: string): IChartSerie[] {
        let series: IChartSerie[] = [];

        for (let serieName in groupedData) {
            let serie: IChartSerie = {
                name: this._noSerieName(serieName) ? NULL_CATEGORY_REPLACEMENT : serieName,
                data: []
            };

            categories.forEach(cat => {
                let dataItem = groupedData[serieName].find((item: any) => {
                    return item._id[matchField] === (cat.id !== NULL_CATEGORY_REPLACEMENT ? cat.id : serieName);
                });

                const chartType = this.chart.chartDefinition.chart.type;
                if ((chartType === 'column' || chartType === 'bar') && dataItem && dataItem.value === 0) {
                    dataItem.value = null;
                }

                serie.data.push( dataItem ? dataItem.value : null );
            });

            series.push(serie);
        }
        // sorting values by data.value/
        if (sortingCriteria && sortingCriteria === SortingCriteriaEnum.Values && (!sortingOrder || (sortingOrder && sortingOrder === SortingOrderEnum.Ascending))) {
            series = orderBy(series, 'data.value', 'asc');
        }
        return series;
    }

    private _formatTarget(target: any[], metadata: any, groupings: any) {
        if (groupings && groupings.length) {
            if (groupings.length > 1) {
                this.commonField = groupings.filter((v, k) => {
                    return v !== 'frequency';
                });
            } else {
                // if chart has no groupings
                this.commonField = ['noGroupingName'];
            }
        } else {
            this.commonField = ['noFrequencyName'];
        }

        if (target.length) {
            let filterActiveTargets = target.filter(t => {
                return t.active !== false;
            });

            // if (metadata.frequency !== 4) {
            //     if (this.futureTarget) {
            //         filterActiveTargets = filterActiveTargets.filter((targ) => {
            //             let futureDate = new Date(targ.datepicker);
            //             let endDate = new Date(moment().endOf('year').toDate());
            //             return endDate < futureDate;
            //         });
            //     } else {
            //         filterActiveTargets = filterActiveTargets.filter((targ) => {
            //             let futureDate = new Date(targ.datepicker);
            //             let endDate = new Date(moment().endOf('year').toDate());
            //             return endDate > futureDate;
            //         });
            //     }
            // }

            this.targetData = map(filterActiveTargets, (v, k) => {
                if (v.appliesTo) {
                    return {
                        _id: {
                            frequency: TargetService.formatFrequency(metadata.frequency, v.datepicker),
                            [this.commonField[0]]: (<any>v).name,
                            stackName: v.appliesTo.value,
                            targetId: v._id
                        },
                        value: v.targetValue,
                        targetId: v._id,
                        percentageCompletion: v.percentageCompletion
                    };
                } else {
                    return {
                        _id: {
                            // frequency: TargetService.formatFrequency(metadata.frequency, v.datepicker),
                            frequency: TargetService.formatFrequency(metadata.frequency, moment().format()),
                            [this.commonField[0]]: (<any>v).name,
                            targetId: v._id
                        },
                        value: (<any>v).targetValue,
                        targetId: v._id,
                        percentageCompletion: v.percentageCompletion
                    };
            }});

            this.frequencyHelper.decomposeFrequencyInfo(this.targetData, metadata.frequency);
        }
    }

    private _injectTargets(data: any[], meta: IChartMetadata, categories: IXAxisCategory[], groupings: string[], series: any[]): void {
        const chartGroupings = this._getXaxisSource(data, meta, groupings);
        const groupDifference = difference(chartGroupings, [meta.xAxisSource]);
        this.targets = this._targetGrouping(data, groupDifference.length, groupDifference[0], meta, categories);

        if (this.targets && this.targets.length) {
            this.targets.forEach((target) => {
                series.push(target);
            });
        }
    }

    private _targetGrouping(data: any[], length: number, groupings: string, meta: IChartMetadata, categories: IXAxisCategory[]): any {
        if (!data || !data.length) { return; }
        switch (length) {
            case 0:
                if (meta.xAxisSource) {
                    return this._targetMetaData(meta, meta.xAxisSource, data, categories);
                } else {
                    return data.map(d => ({
                        name: d._id['noFrequencyName'],
                        type: 'spline',
                        data: [].concat(d.value),
                        targetId: d.targetId,
                        percentageCompletion: d.percentageCompletion
                    }));
                }
            case 1:
                return this._targetMetaData(meta, groupings, data, categories);
        }
    }

    private _targetMetaData(meta: IChartMetadata, groupByField: any, data: any[], categories: IXAxisCategory[]) {
        let targetCategories = [];
        if (meta.frequency === 4) {
            data.forEach((target) => {
                targetCategories.push({
                    id: target._id.year,
                    name: target._id.frequency
                });
            });

            let missingCategories = this._addMissingDates(categories);
            categories = union(categories, targetCategories);

            categories = union(categories, missingCategories);
            categories = uniqBy(categories, 'name');

            this.categories = categories;
        }

        if (!categories || !categories.length) {
            this.categories = this._createCategories(data, meta);
        }

        // check if stack chart, or no groupings charts
        // otherwise go to the else statement
        let groupedData: Dictionary<any> = groupBy(data, (val) => {
            if (val['_id'].hasOwnProperty('stackName') && isNumber(meta.frequency)) {
                return val._id[groupByField] + '_' + val._id['stackName'];
            } else if (val['_id'].hasOwnProperty('noGroupingName')) {
                return val._id[groupByField] + '_' + val._id['noGroupingName'];
            } else {
                return val._id[groupByField];
            }
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

    private _addMissingDates(categories) {
        for (let i = 1; i < categories.length; i++) {
            if (categories[i].id - categories[i - 1].id !== 1) {
                let diff = categories[i].id - categories[i - 1].id;
                let j = 1;
                while (j < diff) {
                    categories.push({
                        id: categories[i - 1].id + j,
                        title: <String>(categories[i - 1].id + 1)
                    });
                    j = j + 1;
                }
            }
        }
        return categories;
    }

    private _targetFormatData(groupedData: Dictionary<any>, categories: IXAxisCategory[], matchField: string) {
        let series: IChartSerie[] = [];
        // adds spline and targetId to series
        // use targetId for edit/delete
        for (let serieName in groupedData) {
            // check if no groupings for chart to fix the multiple targets in no groupings chart
            const noGroupingName = groupedData[serieName].find(name => name._id.noGroupingName);
            let serie: any = {};
            if (!noGroupingName) {
                serie = {
                    name: ((serieName.match(/_[a-z]+/i)) ?
                            ( serieName.replace(serieName, serieName.match(/[^_a-z]+/i)[0]) ) :
                            (serieName || 'Other')),
                    data: []
                };
            } else {
                serie = {
                    name: serieName.split('_')[1],
                    data: []
                };
            }

            serie['type'] = 'spline';
            serie['targetId'] = groupedData[serieName][0].targetId;
            serie['percentageCompletion'] = groupedData[serieName][0].percentageCompletion;

            categories.forEach(cat => {
                let dataItem = groupedData[serieName].find((item: any) => {
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

    private _dummyData(data: any[], metadata: any, target: any[]) {
        let groupingField = (metadata.groupings && metadata.groupings.length) ? camelCase(metadata.groupings[0]) : null;
        if (!data || !data.length) {
            let tempData = getFrequencySequence(data, metadata.frequency, groupingField , metadata.sortingCriteria, metadata.sortingOrder);
            if (!this.commonField || !this.commonField.length) {
                this.commonField = this.chart.groupings;
            }
            let isStackedName;

            let getDate = target.find(t => {
                isStackedName = t.stackName;
                let endDate = new Date(moment().endOf('year').toDate());
                let nextYear = new Date(moment(t.datepicker).endOf('year').toDate());
                return endDate < nextYear;
            });
            let frequencyFormat;
            switch (metadata.frequency) {
                case FrequencyEnum.Monthly:
                    frequencyFormat = moment(getDate.datepicker).add(1, 'month').format('YYYY-MM');
                    break;
                case FrequencyEnum.Quarterly:
                    frequencyFormat = moment(getDate.datepicker).format('YYYY') + '-Q' + moment().add(1, 'quarter').format('Q');
                    break;
                case FrequencyEnum.Yearly:
                    frequencyFormat = moment(getDate.datepicker).format('YYYY');
                    break;
                case FrequencyEnum.Daily:
                    frequencyFormat = moment(getDate.datepicker).format('YYYY-MM-DD');
                    break;
                case FrequencyEnum.Weekly:
                    frequencyFormat = moment(getDate).isoWeek();
                    break;
            }
            tempData.forEach((d) => {
                data.push({
                    _id: {
                        frequency: frequencyFormat,
                        [this.commonField[0]]: isStackedName ? isStackedName : ''
                    },
                    value: 0
                });
            });
        }
    }

    /**
    * Returns the data range to be used for the chart
    * @param dateRange date range object
    * @param metadataDateRange data range that includes a predefined or a custom data range
    */
    protected _getComparisonDateRanges(dateRange: IChartDateRange[], comparisonOptions: string[]): IDateRange[] {
       if (!dateRange || !comparisonOptions) return;

       if (Array.isArray(comparisonOptions) && isEmpty(comparisonOptions[0])) {
           return;
       }

       return comparisonOptions.map(c => {
            if (isEmpty(c)) return;
            return parseComparisonDateRange(this._processChartDateRange(dateRange[0]), c);
       });
    }

    protected getDefinitionForDateRange(kpi, metadata, target): Promise<any> {
        const that = this;

        return this.processChartData(kpi, metadata, target).then(() => {
            return that.buildDefinition(that.basicDefinition, metadata, target);
        });
    }

    protected getDefinitionOfComparisonChart(kpi, metadata: IChartMetadata, target?: ITargetNewDocument[]): Promise<any> {
        if (metadata.dateRange &&
            Array.isArray(metadata.dateRange) &&
            metadata.dateRange[0].predefined === 'custom') {
            this.isCustomDateRange.comparison = true;
        }
        const chartPromises = {
            main: this.getDefinitionForDateRange(cloneDeep(kpi), metadata, target)
        };

        this.comparison.forEach((comparisonDateRange, index) => {
            const newChart = cloneDeep(this);
            const newMetadata = cloneDeep(metadata);
            newMetadata.dateRange = [ { custom: comparisonDateRange } ];
            chartPromises[metadata.comparison[index]] = newChart.getDefinitionForDateRange(cloneDeep(kpi), newMetadata, target);
        });

        return (Bluebird.props(chartPromises) as any).then(output => {
            return Promise.resolve(this._mergeMultipleChartDefinitions(output, metadata));
        });
    }

    private _mergeMultipleChartDefinitions(definitions: any, metadata: IChartMetadata): any {
        let mainDefinition = definitions['main'] || {};
        const comparisonCategoriesWithValues: IComparsionDefObject = this._getComparisonCategoriesWithValues(definitions);
        const definitionSeries: any[] = this._getComparisonSeries(comparisonCategoriesWithValues, metadata);

        mainDefinition.xAxis.categories = this._getComparisonCategories(definitions);
        mainDefinition.series = definitionSeries;
        // here i must sort comparison series
        mainDefinition = this._sortingDataWithComparison(metadata, mainDefinition);
        return mainDefinition;
    }
    private _sortingDataWithComparison(metadata: IChartMetadata, definition: any): any {

        if (!metadata.sortingCriteria ||  !metadata.sortingOrder) { return definition; }

        let series = definition.series;
        let seriesTMP = [];
        let categories = definition.xAxis.categories;
        let categoriesTMP = [];
        let seriesSorted = [];
        let groupedData = [];
        let total = 0;
        let tobeSorted = true;

        switch (metadata.sortingCriteria) {
            case SortingCriteriaEnum.Totals:
                seriesTMP = series;
                break;
            case SortingCriteriaEnum.TotalsMain:
                seriesTMP = series.filter(s => s.stack === 'main');
                break;
            case SortingCriteriaEnum.TotalsPrevious:
                seriesTMP = series.filter(s => s.stack !== 'main');
                break;
            case SortingCriteriaEnum.Groupings:
                series = orderBy(series, 'name', metadata.sortingOrder === SortingOrderEnum.Ascending ? 'asc' : 'desc');
                tobeSorted = false;
                break;
            case SortingCriteriaEnum.Frequency:
                tobeSorted = false;
                break;
            default:
                if (series.find(s => s.name === metadata.sortingCriteria)) {
                    seriesTMP = series.filter(s => s.name === metadata.sortingCriteria);
                }
                break;
            }
        if (tobeSorted) {
            // Here I most sum by index of array
            // to get the final order
            let indexT = seriesTMP[0].data.length;
            for (let index = 0; index < indexT; index++) {
                total = 0;
                seriesTMP.map(s => {
                    total += s.data[index];
                });
                groupedData.push({
                    order: index,
                    totalValue: total
                });
            }
            seriesSorted = orderBy(groupedData, 'totalValue', metadata.sortingOrder === SortingOrderEnum.Ascending ? 'asc' : 'desc');
            // Here is order by totalValue
            // forEach seriesSorted, sort original data by order & adding in new data
            // finally assign to series again
            series.map(ser => {
                let dataTemp = [];
                seriesSorted.map(o => {
                    dataTemp.push(ser.data[o.order]);
                });
                ser.data = dataTemp;
            });
            seriesSorted.map(o => {
                categoriesTMP.push(categories[o.order]);
            });
            definition.xAxis.categories = categoriesTMP;
        }
        definition.series = series;
        return definition;
    }
    private _getComparisonCategoriesWithValues(definitions: any): any {
        const defObject: IComparsionDefObject = {};
        defObject['uniqCategories'] = [];

        // i.e. ['main', 'lastYear']
        const keys: string[] = Object.keys(definitions);
        const that = this;

        for (let i = 0; i < keys.length; i++) {
            if (defObject['data'] === undefined) {
                defObject['data'] = {};
            }
            defObject['data'][keys[i]] = [];

            const definition = definitions[keys[i]];
            const definitionCategories: string[] =  definition.xAxis.categories;
            const series = definition.series || [];

            for (let j = 0; j < series.length; j++) {
                const serie = series[j];

                for (let k = 0; k < definitionCategories.length; k++) {
                    const categoryExist = defObject['uniqCategories'].find(c => c === definitionCategories[k]);
                    if (!categoryExist) {
                        defObject['uniqCategories'].push(definitionCategories[k]);
                    }

                    const categoriesWithValues: ICategoriesWithValues = {
                        category: definitionCategories[k],
                        serieName: serie.name,
                        serieValue: serie.data[k]
                    };

                    // when have targets
                    if (serie.type && serie.targetId) {
                        categoriesWithValues.type = serie.type;
                        categoriesWithValues.targetId = serie.targetId;
                        categoriesWithValues.percentageCompletion = serie.percentageCompletion;
                    }

                    defObject['data'][keys[i]].push(categoriesWithValues);
                }
            }
        }

        return defObject;
    }

    private _getComparisonSeries(obj: IComparsionDefObject, metadata: IChartMetadata): any[] {
        // allCategories => i.e. ['Jan', 'Feb', 'Mar']
        const allCategories: string[] = obj['uniqCategories'];
        const data: IComparsionDefObjectData = obj['data'];
        const keys: string[] = Object.keys(data);

        let serieData = [];
        let hasTarget: ICategoriesWithValues;
        const mainCategories: string[] = uniq(data['main'].map(d => d.category));

        const series = [];
        let objData: any = {};
        const that = this;

        for (let i = 0; i < keys.length; i++) {
            const stack: string = keys[i];
            // { botox: ICategoriesWithValues }
            let bySerieName: Dictionary<ICategoriesWithValues[]> = groupBy(data[stack], 'serieName');
            // ['botox', 'injectables']
            let serieNameKeys: string[] = Object.keys(bySerieName);


            for (let k = 0; k < serieNameKeys.length; k++) {
                for (let j = 0; j < allCategories.length; j++) {
                    // groupKey => i.e. 'botox'
                    const groupKey: string = serieNameKeys[k];
                    const filteredByCategory: ICategoriesWithValues[] = bySerieName[groupKey].filter((obj: ICategoriesWithValues) => {
                        return obj.category === allCategories[j];
                    });

                    serieData = serieData.concat(
                        filteredByCategory.length ? filteredByCategory[0].serieValue : null
                    );
                    hasTarget = filteredByCategory.find((f: ICategoriesWithValues) => !isEmpty(f.type));
                    objData.serieName = groupKey;
                }

                let dateRangeId: string = '';
                if (that.chart && Array.isArray(that.chart.dateRange)) {
                    if (that.chart.dateRange[0].predefined) {
                        dateRangeId = getDateRangeIdFromString(that.chart.dateRange[0].predefined);
                    } else {
                        dateRangeId = 'custom';
                    }
                }
                let comparisonString: string = '';
                if (stack === 'main') {
                    if (that.chart && Array.isArray(that.chart.dateRange)) {
                        comparisonString = that.chart.dateRange[0].predefined;
                        if (!comparisonString) {
                            const customFrom = that.chart.dateRange[0].custom.from;
                            comparisonString = this._getComparisonString(customFrom, metadata.originalFrequency, metadata.frequency);
                        }
                    }
                } else {
                    if (dateRangeId && stack) {
                        comparisonString = PredefinedComparisonDateRanges[dateRangeId][stack];
                        if (!comparisonString) {
                            if (stack.includes('YearsAgo')) {
                                comparisonString = stack.substr(0, stack.indexOf('YearsAgo')) + ' years ago';
                            } else {
                                comparisonString = stack;
                            }
                        }
                    }
                }

                let serieObject: IComparisonSerieObject;

                if (hasTarget) {
                    const targetSerieObjectExist = series.find(s => s.name === hasTarget.serieName);

                    if (!targetSerieObjectExist) {
                        serieObject = {
                            name: objData.serieName,
                            data: serieData,
                            stack: stack,
                            type: 'spline',
                            targetId: hasTarget.targetId,
                            percentageCompletion: hasTarget.percentageCompletion
                        };
                    }
                } else {
                    if (!comparisonString) {
                        comparisonString = metadata.comparison.find(c => c !== undefined);
                    }
                    serieObject = {
                        name: objData.serieName + `(${comparisonString})`,
                        data: serieData,
                        stack: stack,
                        comparisonString: `(${comparisonString})`,
                        category: allCategories[k]
                    };
                }

                if (serieObject) {
                    series.push(serieObject);
                }
                serieData = [];
            }
        }

        const comparisonKey: string = metadata.comparison[0];
        let predefinedDateString: string;

        const chartDateRange: IChartDateRange = metadata.dateRange.find(d => !isEmpty(d.predefined));
        predefinedDateString = chartDateRange ? chartDateRange.predefined : null;

        if (predefinedDateString) {
            Object.keys(PredefinedDateRanges).forEach(key => {
                if (PredefinedDateRanges[key] === predefinedDateString) {
                    predefinedDateString = key;
                }
            });
        }

        return this._sortComparisonSeriesByName(comparisonKey, series, predefinedDateString, metadata.xAxisSource, mainCategories);
    }

    /**
     * series => [{ name: 'botox(this year), data: [5, null] }]
     * comparisonKey => 'previousPeriod'
     */
    private _sortComparisonSeriesByName(comparisonKey: string, series: any[], predefinedDateString: string, xAxisSource: string, mainCategories: string[]): any[] {
        // check if the parameters passed exist first
        const seriesExists: boolean = Array.isArray(series) && (series.length > 0);
        if (isEmpty(comparisonKey) || !seriesExists || !predefinedDateString) {
            return series;
        }

        const comparisonDateRanges: Object = PredefinedComparisonDateRanges[predefinedDateString];
        if (isEmpty(comparisonDateRanges)) {
            return series;
        }

        const cloneSeries: any[] = cloneDeep(series);
        const isFrequency: boolean = !xAxisSource || xAxisSource === 'frequency';


        cloneSeries.forEach(c => {
            c.name = c.name.replace(c.comparisonString, '');
        });

        const mainSeries: any[] = cloneSeries.filter(s => s.stack === 'main');
        const mainSeriesName: string[] = mainSeries.map(m => m.name);

        const sortSeries: any[] = sortBy(cloneSeries, (item) => {
            if (isFrequency) {
                const indexBySerieName: number = mainSeriesName.indexOf(item.name);
                if (indexBySerieName !== -1) {
                    return indexBySerieName;
                }
            } else {
                const indexByCategory: number = mainCategories.indexOf(item.category);
                if (indexByCategory !== -1) {
                    return indexByCategory;
                }
            }
        });

        sortSeries.forEach(s => {
            s.name = `${s.name}${s.comparisonString || ''}`;
            delete s.comparisonString;
            delete s.category;
        });

        return sortSeries;
    }

    private _getComparisonString(dateFrom: Date, originalFrequency: FrequencyEnum, frequency: FrequencyEnum): string {
        let comparisonString = 'custom';

        if (originalFrequency === -1 || originalFrequency === frequency) {
            return comparisonString;
        }

        switch (originalFrequency) {
            case FrequencyEnum.Yearly:
                comparisonString = moment(dateFrom).year().toString();
                break;
            case FrequencyEnum.Monthly:
                comparisonString = moment(dateFrom).format('MMMM');
                break;
            case FrequencyEnum.Quarterly:
                const qtr = moment(dateFrom).quarter().toString();
                comparisonString = `Q${qtr}`;
                break;
        }

        return comparisonString;
    }

    private _getComparisonCategories(definitions: any): string[] {
        let listCategories: string[] = [];

        // i.e. key = 'main', key = 'lastYear'
        Object.keys(definitions).forEach((key: string) => {
            listCategories = listCategories.concat(
                definitions[key].xAxis.categories
            );
        });

        // i.e. ['Jan', 'Feb', ....]
        listCategories = uniq(listCategories);
        return listCategories;
    }

    private _noSerieName(serieName: any): boolean {
        return isEmpty(serieName) ||
               serieName.toLowerCase() === 'undefined' ||
               serieName.toLowerCase() === 'null';
    }

    /**
     * remove xAxis labels to the right side of the chart if data/value exists
     * remove empty space to the right if no data/value exists
     * @param categories
     * @param series
     */
    private _formatCustomDateRangeWithData(categories: IXAxisCategory[], metadata: IChartMetadata, series: any[]): void {
        if (!categories || !series) { return; }
        if (!categories.length || !series.length) { return; }
        if (isNull(metadata.frequency) || isUndefined(metadata.frequency)) { return; }
        // check if the original chart is custom daterange
        // in comparison, check if original chart is custom
        if (!this.isCustomDateRange.regular && !this.isCustomDateRange.comparison) {
            return;
        }

        const newFormat = [];
        // mapping all data properties
        const mapSeries = series.map(s => s.data);

        for (let i = 0; i < mapSeries.length; i++) {
            const data = mapSeries[i];
            /**
             * push categories if element is null
             * step out loop when element is not null
             */
            for (let j = data.length - 1; j >= 0; j--) {
                if (data[j] === null) {
                    if (categories[j].name) {
                        // i.e. 'Jan', '1', '2012'
                        newFormat.push({ id: categories[j].name });
                    }
                } else {
                    break;
                }
            }
        }

        // i.e. id: 'Jan', '1', '2012'
        const groupData = groupBy(newFormat, 'id');
        let cloneCategories;
        if (!cloneCategories) {
            cloneCategories = categories.slice();
        }

        this._showCustomDateRangeWithData(cloneCategories, groupData, series, mapSeries.length);
    }

    private _showCustomDateRangeWithData(categories: IXAxisCategory[], groupedData: any, series: any[], mapSeriesLength: number):  void {
        const that = this;
        for (let i = 0; i < series.length; i++) {
            const data = series[i].data;
            for (let categoryName in groupedData) {
                // check if same position in every data array has null value
                if (groupedData[categoryName].length === mapSeriesLength) {
                    that.categories = that.categories.filter(cat => cat.name !== categoryName);
                }
            }

            // remove elements whose value is null
            for (let j = data.length - 1; j >= 0; j--) {
                if (data[j] === null) {
                    data.splice(j, 1);
                } else {
                    // break out of loop when element reaches value not null
                    break;
                }
            }
        }
    }
}
