import 'datejs';

import { from } from 'apollo-link/lib';
import * as Promise from 'bluebird';
import * as console from 'console';
import { cloneDeep, difference, flatten, groupBy, isEmpty, map, union, uniq, uniqBy, orderBy } from 'lodash';
import * as moment from 'moment';
import * as logger from 'winston';

import { IChart } from '../../../../domain/app/charts/chart';
import { ITargetDocument } from '../../../../domain/app/targets/target';
import {
    getDateRangeIdFromString,
    IChartDateRange,
    IDateRange,
    parseComparisonDateRange,
    parsePredifinedDate,
    PredefinedComparisonDateRanges,
    PredefinedDateRanges,
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
    protected basicDefinition: any;
    protected data: any[];
    protected dateRange: IChartDateRange[];
    protected groupings: string[];
    protected categories: IXAxisCategory[];
    protected series: any[];
    protected targets: any;
    protected drilldown: boolean;
    protected futureTarget: boolean;
    protected comparison: IDateRange[];

    targetData: any[];
    commonField: any[];

    chartPreProcessor: ChartPreProcessorExtention;

    constructor(protected chart: IChart, protected frequencyHelper: FrequencyHelper) {
        if (!chart.kpis || chart.kpis.length < 1) {
            throw 'A chart cannot be created without a KPI';
        }
    }

    /**
     * Process the chart data to it's most basic definition, it's the first step on the chart definition creation pipeline
     * @param kpi
     * @param metadata
     */
    protected processPureChartData(kpi: IKpiBase, metadata?: IChartMetadata): Promise<void> {
        logger.debug('processPureChartData for: ' + this.constructor.name + ' - kpi: ' + kpi.constructor.name);

        // set up all elements for retrieving the data
        this.dateRange = this._getDateRange(metadata.dateRange);
        this.comparison = this._getComparisonDateRanges(this.dateRange, metadata.comparison);

        const mainPromiseName = this.dateRange[0].predefined ? this.dateRange[0].predefined : 'custom';

        const dataPromises = {
            mainPromiseName: kpi.getData([this.dateRange[0].custom], metadata),
        };

        this.comparison.forEach((comparison, index) => {
            dataPromises[metadata.comparison[index]] = kpi.getData([comparison], metadata);
        });

        Promise.props(dataPromises).then(output => {

        });

        return null;
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
        this.drilldown = metadata.isDrillDown;
        this.futureTarget = metadata.isFutureTarget;

        return that.getKPIData(kpi, metadata).then(data => {
            logger.debug('data received, for chart: ' + this.constructor.name + ' - kpi: ' + kpi.constructor.name);
            that.data = data;

            that._dummyData(data, metadata, target);

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
            console.log(JSON.stringify( that.series));

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
            let categoryHelper;
            let noGrouping = !metadata.groupings || !metadata.groupings.length || !metadata.groupings[0];
            if (noGrouping && this.chart.chartDefinition.chart.type !== ChartType.Pie) {
                let dateRange = metadata.dateRange || this.dateRange;
                categoryHelper = this._noGroupingsCategoryHelper(dateRange, metadata.frequency);
                if (categoryHelper && categoryHelper.length) {
                    return categoryHelper;
                }
            }
            return this.frequencyHelper.getCategories(metadata.frequency);
        }

        const uniqueCategories = <string[]> orderBy(uniq(data.map(item => item._id[metadata.xAxisSource])));

        return uniqueCategories.map(category => {
            return {
                id: category,
                name: category
            };
        });
    }

    /**
     * this is used in _createCategories for last(2-5) years predefined range to duplicate categories
     * when groupings is selected and is by frequency
     * @param dateRange ichartdaterange, getting predefined property
     * @param frequency used for frequency enum value
     */

    private _noGroupingsCategoryHelper(dateRange: IChartDateRange[], frequency: number): any[] {
        const predefined = dateRange[0].predefined;
        let duplicateCategories: any[] = [];

        switch (predefined) {
            case PredefinedDateRanges.last2Years:
                [1, 2].forEach(iterator => {
                    duplicateCategories.push(this.frequencyHelper.getCategories(frequency));
                });
                break;
            case PredefinedDateRanges.last3Years:
                [1, 2, 3].forEach(iterator => {
                    duplicateCategories.push(this.frequencyHelper.getCategories(frequency));
                });
                break;
            case PredefinedDateRanges.last4Years:
                [1, 2, 3, 4].forEach(iterator => {
                    duplicateCategories.push(this.frequencyHelper.getCategories(frequency));
                });
                break;
            case PredefinedDateRanges.last5Years:
                [1, 2, 3, 4, 5].forEach(iterator => {
                    duplicateCategories.push(this.frequencyHelper.getCategories(frequency));
                });
                break;
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

        const availableGroupingsForSeries = difference(groupings, [meta.xAxisSource]);


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
                name: '',
                data:  categories.map(cat => {
                    let dataItem = data.find((item: any) => {
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
        let groupedData: Dictionary<any> = groupBy(data, '_id.' + groupByField);

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
                name: this._noSerieName(serieName) ? 'Other' : serieName,
                data: []
            };

            categories.forEach(cat => {
                let dataItem = groupedData[serieName].find((item: any) => {
                    return item._id[matchField] === cat.id;
                });

                serie.data.push( dataItem ? dataItem.value : null );
            });

            series.push(serie);
        }

        return series;
    }

    private _formatTarget(target: any[], metadata: any, groupings: any) {
        if (groupings && groupings.length) {
            this.commonField = groupings.filter((v, k) => {
                return v !== 'frequency';
            });
        }

        if (target.length) {
            let filterActiveTargets = target.filter(t => {
                return t.active !== false;
            });

            if (metadata.frequency !== 4) {
                if (this.futureTarget) {
                    filterActiveTargets = filterActiveTargets.filter((targ) => {
                        let futureDate = new Date(targ.datepicker);
                        let endDate = new Date(moment().endOf('year').toDate());
                        return endDate < futureDate;
                    });
                } else {
                    filterActiveTargets = filterActiveTargets.filter((targ) => {
                        let futureDate = new Date(targ.datepicker);
                        let endDate = new Date(moment().endOf('year').toDate());
                        return endDate > futureDate;
                    });
                }
            }

            this.targetData = map(filterActiveTargets, (v, k) => {
                return (<any>v).stackName ? {
                    _id: {
                        frequency: TargetService.formatFrequency(metadata.frequency, v.datepicker),
                        [this.commonField[0]]: (<any>v).name,
                        stackName: (<any>v).stackName,
                        targetId: v._id
                    },
                    value: (<any>v).target,
                    targetId: v._id
                } : {
                    _id: {
                        frequency: TargetService.formatFrequency(metadata.frequency, v.datepicker),
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
        let groupDifference = difference(groupings, [meta.xAxisSource]);
        this.targets = this._targetGrouping(data, groupDifference.length, groupDifference[0], meta, categories);

        if (this.targets && this.targets.length) {
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

        let groupedData: Dictionary<any> = groupBy(data, (val) => {
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
            let serie: IChartSerie = {
                name: (serieName.match(/_[a-z]+/i)) ?
                        ( serieName.replace(serieName, serieName.match(/[^_a-z]+/i)[0]) ) :
                        (serieName || 'Other'),
                data: []
            };

            serie['type'] = 'spline';
            serie['targetId'] = groupedData[serieName][0].targetId;

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
        if (!data.length) {
            let tempData = getFrequencySequence(metadata.frequency);
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
                case FrequencyEnum.Quartely:
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

       return comparisonOptions.map(c => {
            if (isEmpty(c)) return;
            return parseComparisonDateRange(this._processChartDateRange(dateRange[0]), c);
       });
    }

    protected getDefinitionForDateRange(kpi, metadata, target): Promise<any> {
        const that = this;
        return this.processChartData(kpi, metadata, target).then(() => {
            return that.buildDefinition(that.basicDefinition, target);
        });
    }

    protected getDefinitionOfComparisonChart(kpi, metadata: IChartMetadata): Promise<any> {
        const chartPromises = {
            main: this.getDefinitionForDateRange(kpi, metadata, [])
        };

        this.comparison.forEach((comparisonDateRange, index) => {
            const newChart = cloneDeep(this);
            const newMetadata = cloneDeep(metadata);
            newMetadata.dateRange = [ { custom: comparisonDateRange } ];
            chartPromises[metadata.comparison[index]] = newChart.getDefinitionForDateRange(kpi, newMetadata, []);
        });

        return Promise.props(chartPromises).then(output => {
            return Promise.resolve(this._mergeMultipleChartDefinitions(output, metadata));
        });
    }

    private _mergeMultipleChartDefinitions(definitions: any, metadata: IChartMetadata): any {
        const mainDefinition = definitions['main'] || {};
            let comparisonCategoriesWithValues = this._getComparisonCategoriesWithValues(definitions);
            let definitionSeries = this._getComparisonSeries(comparisonCategoriesWithValues);

            mainDefinition.xAxis.categories = this._getComparisonCategories(definitions, metadata);
            mainDefinition.series = definitionSeries;

            return mainDefinition;
        // if (metadata.xAxisSource !== FREQUENCY_GROUPING_NAME) {
        //     let comparisonCategoriesWithValues = this._getComparisonCategoriesWithValues(definitions);
        //     let definitionSeries = this._getComparisonSeries(comparisonCategoriesWithValues);

        //     mainDefinition.xAxis.categories = this._getComparisonCategories(definitions);
        //     mainDefinition.series = definitionSeries;

        //     return mainDefinition;
        // } else {
        //     let mergedSeries = [];
        //     mergedSeries = mergedSeries.concat(this._getComparisonSeriesFrequency(definitions));
        //     mergedSeries = mergedSeries.concat(this._getMainComparisonSeries(definitions));
        //     mainDefinition.series = mergedSeries;

        //     return mainDefinition;
        // }
    }

    private _getComparisonCategoriesWithValues(definitions: any): any {
        let defObject = {};
        defObject['uniqCategories'] = [];
        const keys = Object.keys(definitions);
        const that = this;

        for (let i = 0; i < keys.length; i++) {
            if (defObject['data'] === undefined) {
                defObject['data'] = {};
            }
            defObject['data'][keys[i]] = [];

            const definition = definitions[keys[i]];
            const cats =  definition.xAxis.categories;

            for (let j = 0; j < definition.series.length; j++) {
                const serie = definition.series[j];

                for (let k = 0; k < cats.length; k++) {
                    const catExists = defObject['uniqCategories'].find(c => c === cats[k]);
                    if (!catExists) {
                        defObject['uniqCategories'].push(cats[k]);
                    }

                    defObject['data'][keys[i]].push({
                        category: cats[k],
                        serieName: serie.name,
                        serieValue: serie.data[k]
                    });
                }
            }
        }

        return defObject;
    }

    private _getComparisonSeries(obj: any): any {
        const allCategories = obj['uniqCategories'];
        const data = obj['data'];
        const keys = Object.keys(data);
        let serieData = [];

        const series = [];
        let objData: any = {};
        const that = this;

        // for (let i = 0; i < keys.length; i++) {
        //     const stack = keys[i];
        //     let bySerieName = groupBy(data[stack], 'serieName');
        //     let serieNameKeys = Object.keys(bySerieName);

        //     for (let j = 0; j < allCategories.length; j++) {
        //         const filteredByCategory = data[stack].filter(e => e.category === allCategories[j]);
        //         serieData = serieData.concat(
        //             filteredByCategory.length ? filteredByCategory[0].serieValue : null
        //         );
        //         objData.serieName = filteredByCategory[0].serieName;
        //     }
        //     const dateRangeId = getDateRangeIdFromString(that.chart.dateRange[0].predefined);
        //     const comparisonString = (stack === 'main') ?
        //                 that.chart.dateRange[0].predefined : PredefinedComparisonDateRanges[dateRangeId][stack];
        //     series.push({
        //         name: objData.serieName + `(${comparisonString})`,
        //         data: serieData,
        //         stack: stack
        //     });
        //     serieData = [];
        // }
        // return series;
        for (let i = 0; i < keys.length; i++) {
            const stack = keys[i];
            let bySerieName = groupBy(data[stack], 'serieName');
            let serieNameKeys = Object.keys(bySerieName);


            for (let k = 0; k < serieNameKeys.length; k++) {
                for (let j = 0; j < allCategories.length; j++) {
                    const groupKeys = serieNameKeys[k];
                    const filteredByCategory = bySerieName[groupKeys].filter(obj => obj.category === allCategories[j]);
                    serieData = serieData.concat(
                        filteredByCategory[0].serieValue
                    );
                    objData.serieName = groupKeys;
                }
                const dateRangeId = getDateRangeIdFromString(that.chart.dateRange[0].predefined);
                const comparisonString = (stack === 'main') ?
                            that.chart.dateRange[0].predefined : PredefinedComparisonDateRanges[dateRangeId][stack];
                series.push({
                    name: objData.serieName + `(${comparisonString})`,
                    data: serieData,
                    stack: stack
                });
                serieData = [];
            }
        }
        return series;
    }

    private _getComparisonSeriesFrequency(definitions: any): any {
        const that = this;

        const definitionsIds = Object.keys(definitions).filter(d => d !== 'main');

        if (!definitionsIds || definitionsIds.length < 1) return [];

        const series = [];

        for (let i = definitionsIds.length; i > 0; i--) {
            if (definitions[definitionsIds[i - 1]].series && definitions[definitionsIds[i - 1]].series.length > 0) {
                const definitionKey = definitionsIds[i - 1];
                definitions[definitionKey].series.forEach(serie => {
                    const dateRangeId = getDateRangeIdFromString(that.chart.dateRange[0].predefined);
                    const comparisonString = PredefinedComparisonDateRanges[dateRangeId][definitionKey];
                    const serieElement = {
                        name: `${serie.name}(${comparisonString})`,
                        data: serie.data,
                        stack: definitionKey
                    };
                    series.push(serieElement);
                });
            }
        }

        return series;
    }

    private _getMainComparisonSeries(definitions: any): any {
        const that = this;
        const main = definitions['main'];

        const series = [];

        main.series.forEach(serie => {
            const comparisonString = that.chart.dateRange[0].predefined;
            const serieElement = {
                name: `${serie.name}(${comparisonString})`,
                data: serie.data,
                stack: 'main'
            };
            series.push(serieElement);
        });

        return series;
    }

    private _getComparisonCategories(definitions: any, metadata: IChartMetadata): string[] {
        let listCategories = [];

        Object.keys(definitions).forEach(key => {
            listCategories = listCategories.concat(
                definitions[key].xAxis.categories
            );
        });

        listCategories = uniq(listCategories);
        if (metadata.xAxisSource !== FREQUENCY_GROUPING_NAME) {
            listCategories = listCategories.sort();
        }
        return listCategories;
    }

    private _noSerieName(serieName: any): boolean {
        return isEmpty(serieName) ||
               serieName === 'undefined' ||
               serieName === 'null';
    }
}
