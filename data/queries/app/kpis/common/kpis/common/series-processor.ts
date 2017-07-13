import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as _ from 'lodash';
import * as moment from 'moment';

export interface ISerieOptions {
    name: string;
    property: string;
}

export class SeriesProcessorExtention {

    public ToSeries(rawData: any[], frequency: FrequencyEnum, options: ISerieOptions): any[] {
         switch (frequency) {
            case FrequencyEnum.Daily:
                 return this._toDailySeries(rawData, options);

            case FrequencyEnum.Weekly:
                 return [];

            case FrequencyEnum.Monthly:
                 return this._toMonthlySeries(rawData, options);

            case FrequencyEnum.Yearly:
                 return [];
         }

         return [];
    }

    private _toNoFrequency(rawData: any[], options: ISerieOptions) {
        return [{
            name: options.name,
            data: rawData.map(item => [ null, item[options.property] ])
        }];
    }

    private _toDailySeries(rawData: any[], options: ISerieOptions): any[] {
        let result = [];
        let years = this._getYearsInData(rawData);

        if (years.length > 1) {
            console.log('trying to see a chart with dayli frequency in a date range with more than one year is not supported');
            return result;
        }

        let months = this._getMonthsInData(rawData);
        months.forEach(m => {
            let serie = {
                name: moment().month(Number(m) - 1).format('MMM'),
                data: this._getValueByMonth(rawData, m, options),
            };

            result.push(serie);
        });

        result = this._fillEmptyDaysWithNull(result, 1, 31);

        return result;
    }

    private _toMonthlySeries(rawData: any[], options: ISerieOptions): any[] {
        let result = [];
        let years = this._getYearsInData(rawData);

        years.forEach(y => {
            let serie = { name: y,
                          data: this._getValueByYear(rawData, y, options) };
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

    private _getValueByYear(rawData: any, year: string, options: ISerieOptions) {
        let data = rawData.filter(d => {
            if (d._id.frequency.indexOf(year) === -1) { return; };
            return d;
        });

        data = _.sortBy(data, '_id.frequency');
        return data.map(item => [ moment(String(item._id.frequency + '-01')).format('MMM'), item[options.property]]);
    }

    private _getValueByMonth(rawData: any, month: string, options: ISerieOptions) {
        let data = rawData.filter(d => {
            if (d._id.frequency.split('-')[1] !== month) { return; };
            return d;
        });

        data = _.sortBy(data, '_id.frequency');
        return data.map(item => [ Number(item._id.frequency.split('-')[2]), item[options.property]]);
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

    private _fillEmptyDaysWithNull(series: any[], start: number, end: number): any[] {
        let data = series.map(s => {
            let month = s.name;
            let serieData = [];
            for (let currDay = start; currDay <= end; currDay++) {
                let value = s.data.find(d => { return Number(d[0]) === currDay; });
                if (value) {
                    serieData.push(value);
                } else {
                    serieData.push([currDay, null]);
                }
            };

            return { name: month, data: serieData };
        });

        return data;
    }

    private _getFirstDayInSerie(series: any[]) {
        let allMinimun = series.map(s =>  _.min(s.data.map(d => d[0])));
        return _.min(allMinimun);
    }

    private _getLastDayInSerie(series: any[]) {
        let allMaximun = series.map(s =>  _.max(s.data.map(d => d[0])));
        return _.max(allMaximun);
    }
}