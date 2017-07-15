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

        this._years = _.uniq(y);
        this._months = _.uniq(m);
        this._weeks = _.uniq(w);
        this._days = _.uniq(d);
        this._quarters = _.uniq(q);
    }

}