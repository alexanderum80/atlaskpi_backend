import { FrequencyEnum, getFrequencySequence } from '../../../../models/common';
import { IXAxisCategory } from './ui-chart-base';
import * as _ from 'lodash';
import * as moment from 'moment';

export interface IFrequencyValues {
    years: number[];
    months: number[];
    weeks: number[];
    days: number[];
    quarters: number[];
}

export interface IFrequencyInfo {
    year?: number;
    month?: number;
    day?: number;
    quarter?: number;
    week?: number;
}

export class FrequencyHelper {
    private _years: number[];
    private _months: number[];
    private _weeks: number[];
    private _days: number[];
    private _quarters: number[];

    decomposeFrequencyInfo(rawData: any[], frequency: FrequencyEnum) {
        this._processFrequency(rawData, frequency);
    }

    get(): IFrequencyValues {
        return {
            years: this._years,
            months: this._months,
            weeks: this._weeks,
            days: this._days,
            quarters: this._quarters
        };
    }

    getCategories(frequency: FrequencyEnum): IXAxisCategory[] {
        let sequence = getFrequencySequence(frequency);

        switch (frequency) {
            case FrequencyEnum.Daily:
            case FrequencyEnum.Weekly:
                return sequence.map(f => { return { id: f, name: String(f) }; });

            case FrequencyEnum.Monthly:
                return sequence.map(f => { return { id: f, name: moment().month(f - 1).format('MMM') }; });

            case FrequencyEnum.Quartely:
                return sequence.map(f => { return { id: f, name: `Q${f}` }; });

            case FrequencyEnum.Yearly:
                return this._years.map(y => { return { id: y, name: String(y) }; });
        }

        return [];
    }

    private _processFrequency(data: any, frequency: FrequencyEnum) {
        let y: number[] = [];
        let m: number[] = [];
        let w: number[] = [];
        let d: number[] = [];
        let q: number[] = [];

        switch (frequency) {
            case FrequencyEnum.Daily:
                data.forEach(item => {
                    let tokens = item._id.frequency.split('-');
                    let freqInfo: IFrequencyInfo = {
                        year: +tokens[0],
                        month: +tokens[1],
                        day: +tokens[2]
                    };

                    // item.frequency = freqInfo;
                    Object.assign(item._id, freqInfo);

                    y.push(freqInfo.year);
                    m.push(freqInfo.month);
                    d.push(freqInfo.day);
                });
                break;
            case FrequencyEnum.Monthly:
                data.forEach(item => {
                    let tokens = item._id.frequency.split('-');
                    let freqInfo: IFrequencyInfo = {
                        year: +tokens[0],
                        month: +tokens[1]
                    };

                    // item.frequency = freqInfo;
                    Object.assign(item._id, freqInfo);

                    y.push(freqInfo.year);
                    m.push(freqInfo.month);
                });
                break;
            case FrequencyEnum.Quartely:
                data.forEach(item => {
                    let tokens = item._id.frequency.split('-');
                    let freqInfo: IFrequencyInfo = {
                        year: +tokens[0],
                        quarter: +tokens[1]
                    };

                    // item.frequency = freqInfo;
                    Object.assign(item._id, freqInfo);

                    y.push(freqInfo.year);
                    q.push(freqInfo.quarter);
                });
                break;
            case FrequencyEnum.Weekly:
                data.forEach(item => {
                    let freqInfo: IFrequencyInfo = {
                        week: +item._id.frequency
                    };

                    // item.frequency = freqInfo;
                    Object.assign(item._id, freqInfo);

                    w.push(freqInfo.week);
                });
                break;
            case FrequencyEnum.Yearly:
                data.forEach(item => {
                    let freqInfo: IFrequencyInfo = {
                        year: +item._id.frequency
                    };

                    // item.frequency = freqInfo;
                    Object.assign(item._id, freqInfo);

                    y.push(freqInfo.year);
                });
                break;
        }

        this._years = this._fixSequence(y);
        this._months = this._fixSequence(m);
        this._weeks = this._fixSequence(w);
        this._days = this._fixSequence(d);
        this._quarters = this._fixSequence(q);
    }

    private _fixSequence(sequence: number[]): number[] {
        let cleanList = _.uniq(sequence).sort();
        let min = _.min(cleanList);
        let max = _.max(cleanList);
        let output: number[] = [];

        for (let i = min; i <= max; i++) {
            output.push(i);
        }

        return output;
    }

}