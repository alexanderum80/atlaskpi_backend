import { FrequencyTable } from '../../../models/common';
import { getGroupingMetadata } from '../../../queries/app/charts';
import { ChartFactory } from '../../../queries/app/charts/charts/chart-factory';
import { KpiFactory } from '../../../queries/app/kpis';
import { IDateRange } from '../../../models/common';
import { parsePredifinedDate } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import { ITargetModel } from '../../../models/app/targets/ITarget';
import { IIdentity } from '../../../models/app/identity';
import { IMutationResponse } from '../../../models/common/mutation-response';
import { MutationBase } from '../../mutation-base';
import * as Promise from 'bluebird';
import * as moment from 'moment';


export class CreateTargetMutation extends MutationBase<IMutationResponse> {

    chartInfo: any;

    constructor(public identity: IIdentity,
                private _TargetModel: ITargetModel,
                private _ctx: IAppModels) {
                    super(identity);
                }

    run(data: any): Promise<IMutationResponse> {
        const that = this;
        let _data = data.hasOwnProperty('data') ? data.data : data;
        return new Promise<IMutationResponse>((resolve, reject) => {

            let promises = [];
            let targetData = that._caculateFormat(_data)
                .then((response) => {
                    return response;
                });

            promises.push(targetData);

            return Promise.all(promises)
                .then((dataTarget) => {
                    _data.target = dataTarget[0];

                    that._TargetModel.createTarget(_data)
                        .then((target) => {
                            let uiChart = ChartFactory.getInstance(that.chartInfo);
                            let kpi = KpiFactory.getInstance(that.chartInfo.kpis[0], that._ctx);
                            let groupings = getGroupingMetadata(that.chartInfo, data.input ? data.input.groupings : []);

                            let frequency = FrequencyTable[(data.input && data.input.frequency) ? data.input.frequency : that.chartInfo.frequency];
                            let definitionParameters = {
                                filter: that.chartInfo.filter,
                                frequency: frequency,
                                groupings: groupings,
                                xAxisSource: that.chartInfo.xAxisSource
                            };

                            uiChart.getDefinition(kpi, definitionParameters, [target])
                                .then((definition) => {
                                    that.chartInfo.chartDefinition = definition;
                                });
                            resolve({ entity: target, success: true });
                            return;
                        }).catch((err) => {
                            resolve({ success: false, errors: [ {field: 'target', errors: [err]} ] });
                            return;
                        });
                });
        });
    }

    private _leftHand(data: any): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            const that = this;
            let promises = [];
            let p = that._ctx.Chart.findById(data.chart[0])
                .populate({
                    path: 'kpis'
                })
                .then((chart) => {
                    return chart;
                });
            promises.push(p);
            return Promise.all(promises)
                .then((chart) => {
                    that.chartInfo = chart;
                    let kpi = KpiFactory.getInstance(chart[0].kpis[0], that._ctx);
                    let options = {
                        filter: chart[0].filter
                    };
                    kpi.getData(that._getDate(data.period), options).then((response) => {
                        resolve(response);
                    }).catch((err) => {
                        reject(err);
                    });
                });
        });
    }

    private _caculateFormat(data: any): Promise<any> {

        return new Promise((resolve, reject) => {
            let promises = [];
            let left = this._leftHand(data)
                .then((response) => {
                    return response[0].value;
                });
            promises.push(left);

            return Promise.all(promises)
                .then((response) => {
                    let _amount = parseFloat(data.amount);
                    switch (data.vary) {

                        case 'fixed':
                            return resolve(_amount);

                        case 'increase':
                            switch (data.amountBy) {
                                case 'percent':
                                    let increasePercentResult = response[0] + (response[0] * (_amount / 100) );
                                    return resolve(increasePercentResult);

                                case 'dollar':
                                    let increaseDollarResult = response[0] + _amount;
                                    return resolve(increaseDollarResult);

                            }
                        case 'decrease':
                            switch (data.amountBy) {
                                case 'percent':
                                    let decreasePercentResult = response[0] - (response[0] * (_amount / 100) );
                                    return resolve(decreasePercentResult);

                                case 'dollar':
                                    let descreaseDollarResult = response[0] - _amount;
                                    return resolve(descreaseDollarResult);

                            }
                    }

                });
        });
    }

    private _getDate(period: string): IDateRange {
        return parsePredifinedDate(period);
    }
}


/*
    {
        _id: {
            frequency: '2017-12',
            year: 2017,
            month: 5
        }
    }

    {
        id: month in number,
        name: month in name
    }

*/