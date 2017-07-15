import { FrequencyEnum, IDateRange } from '../../../../models/common';
import { IKPIDocument, IAppModels } from '../../../../models/app';
import { getKPI } from '../../kpis/kpi.factory';
import { IKpiBase, IKPIResult } from '../../kpis/kpi-base';
import { IChart, IChartDocument } from '../../../../models/app/charts';
import { ChartPreProcessorExtention } from './chart-preprocessor-extention';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';
import * as moment from 'moment';


import { ChartPostProcessingExtention } from './chart-postprocessing-extention';

export interface IUIChart {
    prepareCategories();
    prepareSeries();
    getDefinition(dateRange: IDateRange, frequency: FrequencyEnum): Promise<any>;
    getUIDefinition?(kpiBase: IKpiBase, dateRange: IDateRange, frequency: FrequencyEnum, grouping: string): Promise<string>;
};

export abstract class UIChartBase {
    private _kpi: IKpiBase;

    series: any;
    categories: any;

    frequencies: string[];
    groupings: string[];
    data: any;

    chartPreProcessor: ChartPreProcessorExtention;

    constructor(private _chart: IChart) {
        if (!_chart.kpis || _chart.kpis.length < 1) {
            throw 'A chart cannot be created with a KPI';
        }
    }

    getKPIData(dateRange: IDateRange, frequency: FrequencyEnum): Promise<IKPIResult> {
        let that = this;

        return new Promise<IKPIResult>((resolve, reject) => {
            let chartDr;
            if (this._chart.dateFrom && this._chart.dateTo) {
                chartDr = { from: new Date(this._chart.dateFrom), to: new Date(this._chart.dateTo) };
            }

            dateRange = dateRange || chartDr;
            console.log(frequency);

            return that._kpi.getData(dateRange, frequency).then(data => {
                that.data = data;
                that.frequencies = this.getFrequencies(data, frequency);
                that.groupings = this.getGroupings(data);
                resolve(data);
            })
            .catch(err => reject(err));
        });
    }

    /**
     * Gets a uniq list of frecuencies on the kpi result.
     * @param {IKPIResult} res - the response of the kpi's getData method
     * @returns {Array<string>} - an array of string
     */
    public getFrequencies(data: any, frequency: FrequencyEnum): string[] {
        switch (frequency) {
            case FrequencyEnum.Daily:
                 return this._getDailyFrequencies();

            case FrequencyEnum.Weekly:
                 return this._getWeeklyFrequencies();

            case FrequencyEnum.Monthly:
                 return this._getMonthlyFrequencies(data);

            case FrequencyEnum.Quartely:
                 return this._getQuartersInData(data);

            case FrequencyEnum.Yearly:
                 return this._getYearlyFrequencies(data);
         }
        return [];
    }


    public getGroupings(res: IKPIResult): string[] {
        let groups: string[] = [];
        if (!res.data || !res.data[0]._id) { return groups; };

        res.data.map(serie => {
            Object.keys(serie._id).forEach(k => {
                if (k === 'frequency' || groups.find(e => e === k)) { return; }
                groups.push(k);
            });
        });

        return groups;
    }

    public getSeriesByFrequency(frequency: FrequencyEnum) {
        if (!this.data) {
            console.log('you have to call getData() before getting the series');
            return null;
        }

        switch (frequency) {
            case FrequencyEnum.Daily:
                 return this._getSeriesByDay(this.data);

            case FrequencyEnum.Weekly:
                //  return this._getSeriesByWeek(res);
                return [];

            case FrequencyEnum.Monthly:
                 return this._getSeriesByMonth(this.data);

            case FrequencyEnum.Yearly:
                 return [];
         }

         return [];

    }



    private _getDailyFrequencies() {
        let numbers = [];
        for (let i = 1; i <= 31; i++) {
            numbers.push(i);
        }
        return numbers;
    }

    private _getMonthlyFrequencies(res: IKPIResult): any[] {
        return this._getMonthsInData(res.data);
    }

    private _getWeeklyFrequencies() {
        let numbers = [];
        for (let i = 0; i <= 53; i++) {
            numbers.push(i);
        }
        return numbers;
    }

    private _getYearlyFrequencies(res: IKPIResult): any[] {
        return this._getYearsInData(res.data);
    }

    private _getQuartersInData(rawData: any[]): string[] {
        let qs = [];
        try {
            let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
            qs = _.uniq(frequencies.map(f => { return f.split('-')[1]; }));
        }
        catch (err) {
            console.log('error trying to extract months...: ' + err);
        }
        return qs || [];
    }

     private _getYearsInData(rawData: any[]): string[] {
        let years = [];
        try {
            let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
            years = _.uniq(frequencies.map(f => { return f.split('-')[0]; }));
        }
        catch (err) {
            console.log('error trying to extract year...: ' + err);
        }
        return years || [];
    }

    private _getMonthsInData(rawData: any[]): string[] {
        let months = [];
        try {
            let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
            months = _.uniq(frequencies.map(f => { return f.split('-')[1]; }));
        }
        catch (err) {
            console.log('error trying to extract months...: ' + err);
        }
        return months || [];
    }

    private _getDaysInData(rawData: any[]): string[] {
        let days = [];
        try {
            let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
            days = _.uniq(frequencies.map(f => { return f.split('-')[2]; }));
        }
        catch (err) {
            console.log('error trying to extract days...: ' + err);
        }
        return days || [];
    }

     private _getSeriesByDay(data): any[] {
        let result = [];
        let years = this._getYearsInData(data);

        if (years.length > 1) {
            console.log('daily frecuencies only support a daterange of a year at this moment... displaying nothing...');
            return result;
        }

        let months = this._getMonthsInData(data);

        if (months.length === 1) {
            result.push(this._getValueByMonth(data, months[0]));
            result = this._fillEmptyDaysWithNull(result, 1, 31);
        }

        months.forEach(m => {
            let serie = {
                name: moment().month(Number(m) - 1).format('MMM'),
                data: this._getValueByMonth(data, m)
            };

            result.push(serie);
        });

        result = this._fillEmptyDaysWithNull(result, 1, 31);

        return result;
    }

    private _getSeriesByMonth(data): any[] {
        let result = [];
        let years = this._getYearsInData(data);

        // if (years.length === 1) {
        //     return this._getValueByYear(res.data, years[0]);
        // }

        years.forEach(y => {
            let serie = { name: y,
                          data: this._getValueByYear(data, y) };
            result.push(serie);
        });

        return result;
    }

    private _getValueByMonth(rawData: any, month: string) {
        let data = rawData.filter(d => {
            if (d._id.frequency.split('-')[1] !== month) { return; };
            return d;
        });

        data = _.sortBy(data, '_id.frequency');
        return data.map(item => [ Number(item._id.frequency.split('-')[2]), item.value]);
    }

    private _formatNumber(n: number, length = 2) {
        return (n < 10)
                ? '0' + n
                : n;
    }

     // months numbers starting 0
    private _fillEmptyMonthsWithNull(series: any[], startingMonth: number, endingMonth: number): any[] {
        let data = series.map(s => {
            let year = s.name;
            let serieData = [];
            for (let currMonth = startingMonth; currMonth <= endingMonth; currMonth++) {
                let value = s.data.find(d => { return Number(d[0].split('-')[1]) === currMonth; });
                if (value) {
                    serieData.push(value);
                } else {
                    serieData.push([`${year}-${this._formatNumber(currMonth)}`, null]);
                }
            };

            return { name: year, data: serieData };
        });

        return data;
    }

    private _fillEmptyDaysWithNull(series: any, start: number, end: number): any[] {
        if (series && !series.name) {
            return this._fillSimpleSerieWithNullValues(series, start, end);
        }

        let data = series.map(s => {
            let month = s.name;
            let serieData = this._fillSimpleSerieWithNullValues(s.data, start, end);
            return { name: month, data: serieData };
        });

        return data;
    }

    private _fillSimpleSerieWithNullValues(series: any, start: number, end: number): any[] {
        let simpleSerie = [];
        for (let currDay = start; currDay <= end; currDay++) {
            let value = series.find(d => { return Number(d[0]) === currDay; });
            if (value) {
                simpleSerie.push(value);
            } else {
                simpleSerie.push([currDay, null]);
            }
        };

        return simpleSerie;
    }

     private _getValueByYear(rawData: any, year: string) {
        let data = rawData.filter(d => {
            if (d._id.frequency.indexOf(year) === -1) { return; };
            return d;
        });

        data = _.sortBy(data, '_id.frequency');
        return data.map(item => [ moment(String(item._id.frequency + '-01')).format('MMM'), item.value]);
    }



}