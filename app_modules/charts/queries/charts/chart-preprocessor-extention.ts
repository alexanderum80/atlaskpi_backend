import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import { IKPIMetadata, IKPIResult } from '../../kpis/kpi-base';
import * as _ from 'lodash';
import * as moment from 'moment';

// export interface ISerieOptions {
//     name: string;
//     property: string;
// }

export class ChartPreProcessorExtention {

    /**
     * Gets a uniq list of frecuencies on the kpi result.
     * @param {IKPIResult} res - the response of the kpi's getData method
     * @returns {Array<string>} - an array of string
     */
    public getFrequencies(res: IKPIResult): string[] {
        switch (res.metadata.frequency) {
            case FrequencyEnum.Daily:
                 return this._getDailyFrequencies();

            case FrequencyEnum.Weekly:
                 return this._getWeeklyFrequencies();

            case FrequencyEnum.Monthly:
                 return this._getMonthlyFrequencies(res);

            case FrequencyEnum.Quartely:
                 return this._getQuartersInData(res.data);

            case FrequencyEnum.Yearly:
                 return this._getYearlyFrequencies(res);
         }
        return [];
    }


    /**
     * Get the series ready for HighCharts, it handles simple series or named series
     * @param {IKPIResult} res - the response of the kpi's getData method
     * @returns {Array<any>} - an array of strings | number | object with name and data
     */
    public getSeries(res: IKPIResult): any[] {
        switch (res.metadata.frequency) {
            case FrequencyEnum.Daily:
                 return this._getSeriesByDay(res);

            case FrequencyEnum.Weekly:
                //  return this._getWeeklySeries();

            case FrequencyEnum.Monthly:
                return this._getSeriesByMonth(res);

            case FrequencyEnum.Quartely:
                //  return this._getQuarterlySeries(res.data);

            case FrequencyEnum.Yearly:
                //  return this._getYearlySeries(res);
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

    public ToFrequencySeries(res: IKPIResult): any[] {
         switch (res.metadata.frequency) {
            case FrequencyEnum.Daily:
                 return this._getSeriesByDay(res);

            case FrequencyEnum.Weekly:
                //  return this._getSeriesByWeek(res);
                return [];

            case FrequencyEnum.Monthly:
                 return this._getSeriesByMonth(res);

            case FrequencyEnum.Yearly:
                 return [];
         }

         return [];
    }

    public ToSeries(res: IKPIResult): any[] {
         switch (res.metadata.frequency) {
            case FrequencyEnum.Daily:
                 return this._getSeriesByDay(res);

            case FrequencyEnum.Weekly:
                 return [];

            case FrequencyEnum.Monthly:
                 return this._getSeriesByMonth(res);

            case FrequencyEnum.Yearly:
                 return [];
         }

         return [];
    }

    private _toNoFrequency(res: IKPIResult) {
        return [{
            name: res.metadata.name || null,
            data: res.data.map(item => [ item.value ])
        }];
    }

    private _getSeriesByDay(res: IKPIResult): any[] {
        let result = [];
        let years = this._getYearsInData(res.data);

        if (years.length > 1) {
            console.log('daily frecuencies only support a daterange of a year at this moment... displaying nothing...');
            return result;
        }

        let months = this._getMonthsInData(res.data);

        if (months.length === 1) {
            result.push(this._getValueByMonth(res.data, months[0]));
            result = this._fillEmptyDaysWithNull(result, 1, 31);
        }

        months.forEach(m => {
            let serie = {
                name: moment().month(Number(m) - 1).format('MMM'),
                data: this._getValueByMonth(res.data, m)
            };

            result.push(serie);
        });

        result = this._fillEmptyDaysWithNull(result, 1, 31);

        return result;
    }

    private _getSeriesByMonth(res: IKPIResult): any[] {
        let result = [];
        let years = this._getYearsInData(res.data);

        // if (years.length === 1) {
        //     return this._getValueByYear(res.data, years[0]);
        // }

        years.forEach(y => {
            let serie = { name: y,
                          data: this._getValueByYear(res.data, y) };
            result.push(serie);
        });

        return result;
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

    private _getValueByYear(rawData: any, year: string) {
        let data = rawData.filter(d => {
            if (d._id.frequency.indexOf(year) === -1) { return; };
            return d;
        });

        data = _.sortBy(data, '_id.frequency');
        return data.map(item => [ moment(String(item._id.frequency + '-01')).format('MMM'), item.value]);
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

    private _getFirstDayInSerie(series: any[]) {
        let allMinimun = series.map(s =>  _.min(s.data.map(d => d[0])));
        return _.min(allMinimun);
    }

    private _getLastDayInSerie(series: any[]) {
        let allMaximun = series.map(s =>  _.max(s.data.map(d => d[0])));
        return _.max(allMaximun);
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

}