import { FrequencyEnum, IDateRange, getFrequencyPropName, getFrequencySequence } from '../../../../models/common';
import { IKPIDocument, IAppModels } from '../../../../models/app';
import { getKPI } from '../../kpis/kpi.factory';
import { IKpiBase, IKPIResult } from '../../kpis/kpi-base';
import { IChart, IChartDocument } from '../../../../models/app/charts';
import { ChartPreProcessorExtention } from './chart-preprocessor-extention';
import { IFrequencyValues, FrequencyHelper } from './frequency-values';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as _ from 'lodash';


import { ChartPostProcessingExtention } from './chart-postprocessing-extention';

export interface IXAxisCategory {
    id: string | number;
    name: string;
}

export interface IChartSerie {
    name: string | number;
    data: any[];
}

export interface IUIChart {
    prepareCategories();
    prepareSeries();
    getDefinition(dateRange: IDateRange, frequency: FrequencyEnum): Promise<any>;
    getUIDefinition?(kpiBase: IKpiBase, dateRange: IDateRange, frequency: FrequencyEnum, grouping: string): Promise<string>;
};

export interface IChartMetadata {
    frequency?: FrequencyEnum;
    grouping?: string;
    xAxisDataSource?: string;
}

export enum CreateSeriesByEnum {
    Frequency,
    Grouping
}

export abstract class UIChartBase {
    protected series: any[];
    protected categories: any[];

    protected grouping: string;
    protected data: any[];

    chartPreProcessor: ChartPreProcessorExtention;

    constructor(private _chart: IChart, protected frequencyHelper: FrequencyHelper) {
        if (!_chart.kpis || _chart.kpis.length < 1) {
            throw 'A chart cannot be created with a KPI';
        }
    }

    getKPIData(kpi: IKpiBase, dateRange: IDateRange, metadata?: IChartMetadata): Promise<IKPIResult> {
        let that = this;

        return new Promise<IKPIResult>((resolve, reject) => {
            let chartDr;
            if (this._chart.dateFrom && this._chart.dateTo) {
                chartDr = { from: new Date(this._chart.dateFrom), to: new Date(this._chart.dateTo) };
            }

            dateRange = dateRange || chartDr;
            console.log(metadata.frequency);

            return kpi.getData(dateRange, metadata.frequency, metadata.grouping).then(data => {
                that.data = data;
                that.frequencyHelper.extractFrequency(data, metadata.frequency);
                let categories = that._createCategories(data, metadata);
                let series = that.createSeries(data, CreateSeriesByEnum.Frequency, { frequency: metadata.frequency });

                // TODO: pending when we deal with second level groupings
                // that.groupings = this.getGroupings(data);
                resolve(data);
            })
            .catch(err => reject(err));
        });
    }

    private createSeries(data: any[], by: CreateSeriesByEnum, extra: IChartMetadata): any[] {
        if (!data) {
            console.log('you have to call getData() before getting the series');
            return null;
        }

        if (by === CreateSeriesByEnum.Frequency && !extra.frequency) {
            throw new Error('Chart frequency is missing');
        }

        if (by === CreateSeriesByEnum.Grouping && !extra.grouping) {
            throw new Error('Chart grouping is missing');
        }


        switch (by) {
            case CreateSeriesByEnum.Frequency:
                return this._getSeriesByFrequency(data, extra.frequency);
            case CreateSeriesByEnum.Grouping:
                // return this._createSeriesByGrouping();
                break;
        }
    }

    private _getSeriesByFrequency(data: any[], frequency: FrequencyEnum): IChartSerie[] {
        let dataGroupedByYear = _.groupBy(data, 'frequency.year');
        let frequencyName = getFrequencyPropName(frequency);

        let series: IChartSerie[] = this.frequencyHelper.get().years.map(y => {
            return {
                name: y,
                data: dataGroupedByYear[y].map(item => [item.frequency[frequencyName], item.value])
            };
        });

        // once we have the series data we need to make sure the sequence is completed
        let freqSequence = getFrequencySequence(frequency);

        if (freqSequence) {
            for (let i = 0; i < series.length; i++) {
                let completed = freqSequence.map(freq => {
                    let dataValue = series[i].data.find(dataItem => freq === dataItem[0]);
                    return dataValue ? dataValue[1] : null;
                });

                series[i].data = completed;
            }
        }

        return series;
    }

    private _createCategories(data: any, metadata: IChartMetadata): string[] {
       if (metadata.xAxisDataSource === 'frequency') {
           this.frequencyHelper.getCategories(metadata.frequency);
       }

        return [];
    }


    // private _getSeriesByDay(data): any[] {
    //     if (this.frequencieValues.years.length > 1) {
    //         console.log('daily frecuencies only support a date range of a year at this moment... displaying nothing...');
    //         return [];
    //     }


    //     // if (this.frequencieValues.months.length === 1) {
    //     //     result.push(this._getValueByMonth(data, months[0]));
    //     //     result = this._fillEmptyDaysWithNull(result, 1, 31);
    //     // }

    //     return this.frequencieValues.months.map(m => {
    //         return {
    //             name: moment().month(m - 1).format('MMM'),
    //             data: this._fillEmptyDaysWithNull(this._getMonthlySeries(data, m), 1, 31)
    //         };
    //     });
    // }

    // private _getMonthlySeries(rawData: any[], month: number) {
    //     return rawData.map(d => {
    //         if (d.frequency.month !== month) { return; }
    //         return d.map(item => [month, item.value]);
    //     });
    // }

    // private _formatNumber(n: number, length = 2) {
    //     return (n < 10)
    //             ? '0' + n
    //             : n;
    // }

     // months numbers starting 0
    // private _fillEmptyMonthsWithNull(series: any[], startingMonth: number, endingMonth: number): any[] {
    //     let data = series.map(s => {
    //         let year = s.name;
    //         let serieData = [];
    //         for (let currMonth = startingMonth; currMonth <= endingMonth; currMonth++) {
    //             let value = s.data.find(d => { return Number(d[0].split('-')[1]) === currMonth; });
    //             if (value) {
    //                 serieData.push(value);
    //             } else {
    //                 serieData.push([`${year}-${this._formatNumber(currMonth)}`, null]);
    //             }
    //         };

    //         return { name: year, data: serieData };
    //     });

    //     return data;
    // }

    // private _fillEmptyDaysWithNull(series: any, start: number, end: number): any[] {
    //     if (series && !series.name) {
    //         return this._fillSimpleSerieWithNullValues(series, start, end);
    //     }

    //     let data = series.map(s => {
    //         let month = s.name;
    //         let serieData = this._fillSimpleSerieWithNullValues(s.data, start, end);
    //         return { name: month, data: serieData };
    //     });

    //     return data;
    // }

    // private _fillSimpleSerieWithNullValues(series: any, start: number, end: number): any[] {
    //     let simpleSerie = [];
    //     for (let currDay = start; currDay <= end; currDay++) {
    //         let value = series.find(d => { return Number(d[0]) === currDay; });
    //         if (value) {
    //             simpleSerie.push(value);
    //         } else {
    //             simpleSerie.push([currDay, null]);
    //         }
    //     };

    //     return simpleSerie;
    // }
}