import { FrequencyEnum } from '../../../../models/common';
import * as _ from 'lodash';

export interface IFrequencyValues {
    years: number[];
    months: number[];
    weeks: number[];
    days: number[];
    quarters: number[];
}

export class FrequencyValues {
    private _years: number[];
    private _months: number[];
    private _weeks: number[];
    private _days: number[];
    private _quarters: number[];

    constructor(rawData: any[], frequency: FrequencyEnum) {
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
                    y.push(tokens[0]);
                    m.push(tokens[1]);
                    d.push(tokens[2]);
                });
                break;
            case FrequencyEnum.Monthly:
                data.forEach(item => {
                    let tokens = item._id.frequency.split('-');
                    y.push(tokens[0]);
                    m.push(tokens[1]);
                });
                break;
            case FrequencyEnum.Quartely:
                data.forEach(item => {
                    let tokens = item._id.frequency.split('-');
                    y.push(tokens[0]);
                    q.push(tokens[1]);
                });
                break;
            case FrequencyEnum.Weekly:
                data.forEach(item => {
                    w.push(item._id.frequency);
                });
                break;
            case FrequencyEnum.Yearly:
                data.forEach(item => {
                    y.push(item._id.frequency);
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

        for (let i = min; i < max; i++) {
            output.push(i);
        }

        return output;
    }

}