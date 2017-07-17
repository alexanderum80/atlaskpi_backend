
import { IKpiBase } from '../kpi-base';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

export class LeftDivRightMult100Kpi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      {

    constructor(private _leftKpi: IKpiBase,
                private _rightKpi: IKpiBase) { }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        const that = this;

        let lKpi;
        let rKpi;

        return this._rightKpi.getData(dateRange, frequency)
             .then((t) => {
                rKpi = t;
                return this._leftKpi.getData(dateRange, frequency);
            }).then((p) => {
                lKpi = p;
                return that._calc(lKpi, rKpi);
            });
    }

    getDataToSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        return this.getData(dateRange, frequency);
    }

    private _calc(l: any[], r: any[]): Promise<any> {
        let result = [];

        r.forEach(t => {
                let calc = this._getDivisionByFrequencyItem(t._id.frequency, l, r);
                if (!calc) { return; }
                result.push({ _id: { frequency: t._id.frequency },
                                     value: calc });
        });
        return Promise.resolve(result);
    }

    private _getDivisionByFrequencyItem(frequencyItem: string, l: any[], r: any[]) {

        let lFrequencyItem = l.find(h => h._id.frequency === frequencyItem);

        let rFrequencyItem = r.find(h => h._id.frequency === frequencyItem);

        if (!rFrequencyItem || rFrequencyItem.value === 0) { return null; };
        if (!lFrequencyItem) { return 0; };

        // validation check for operand order, to help for debuging
        if (lFrequencyItem.value > rFrequencyItem.value) {
            throw 'Total revenue cannot be less than part revenue, give it a try switching the order of the arguments of RatioSalesCalculatorKPI.getData(...)';
        }

        return lFrequencyItem.value / rFrequencyItem.value * 100;
    }

}