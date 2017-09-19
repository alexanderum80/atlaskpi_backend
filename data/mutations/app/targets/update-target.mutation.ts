import { IAppModels } from '../../../models/app/app-models';
import { KpiFactory } from '../../../queries/app/kpis';
import { IDateRange } from '../../../models/common';
import { parsePredifinedDate } from '../../../models/common';
import { IUserModel } from '../../../models/app/users';
import { ITargetModel } from '../../../models/app/targets/ITarget';
import { IIdentity } from '../../../models/app/identity';
import { IMutationResponse } from '../../../models/common';
import { MutationBase } from '../..';
import * as Promise from 'bluebird';

export class UpdateTargetMutation extends MutationBase<IMutationResponse> {

    chartInfo: any;
    isStacked: any;

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
            let owner = _data.owner === that.identity.username;
            promises.push(owner);

            return Promise.all(promises)
                .then((response) => {
                    if (response[0] === true) {
                        let promiseData = that._caculateFormat(_data)
                            .then((response) => {
                                return [response];
                            });

                        return Promise.all(promiseData)
                            .then((dataTarget) => {
                                 _data.target = dataTarget[0];

                                that._TargetModel.updateTarget(data.id, _data)
                                    .then((theTarget) => {
                                        resolve({ success: true, entity: theTarget });
                                        return;
                                    }).catch((err) => {
                                        resolve({ success: false, errors: [ {field: 'target', errors: [err]} ] });
                                        return;
                                    });
                            });
                    }
                    reject({ success: false, errors: [ { field: 'target', errors: ['Not permitted to updateTarget'] } ] });
                }).catch((err) => {
                    resolve({ success: false, errors: [ { field: 'target', errors: [err] } ]});
                });
        });
    }

    private _periodData(data: any): Promise<any> {

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
                    that.isStacked = ((chart[0].chartDefinition.chart.type === 'column') &&
                        (chart[0].groupings[0] === chart[0].xAxisSource)) ?
                        true : false;

                    if (that.isStacked) {
                        let options = {
                            filter: chart[0].filter,
                            groupings: [chart[0].groupings[0] + '.name'],
                            stackName: data.stackName || null
                        };
                        kpi.getTargetData(that._getDate(data.period), options).then((response) => {
                            resolve(response);
                        }).catch((err) => {
                            reject(err);
                        });
                    } else {
                        let options = {
                            filter: chart[0].filter
                        };
                        kpi.getData(that._getDate(data.period), options).then((response) => {
                            resolve(response);
                        }).catch((err) => {
                            reject(err);
                        });
                    }
                });
        });
    }

    private _caculateFormat(data: any): Promise<any> {

        return new Promise((resolve, reject) => {
            let promises = [];
            let left = this._periodData(data)
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
        console.log('TARGET DATE RANGE HELP');
        console.log(parsePredifinedDate(period));
        return parsePredifinedDate(period);
    }
}