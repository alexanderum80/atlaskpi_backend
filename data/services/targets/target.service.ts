import { IAppModels } from '../../models/app/app-models';
import { IChartModel } from '../../models/app/charts/index';
import { KpiFactory } from '../../queries/app/kpis/index';
import { IDateRange, parsePredifinedDate } from '../../models/common/index';
import { ITargetModel } from '../../models/app/targets/ITarget';
import { IUserModel } from '../../models/app/users/index';
import * as Promise from 'bluebird';


export class TargetService {

    chartInfo: any;
    isStacked: any;

    constructor(private _user: IUserModel,
                private _target: ITargetModel,
                private _chart: IChartModel) { }

    getTargets(chartId: string, userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._target.findVisibleTargets(chartId, userId)
                .then((targets) => {
                    resolve(targets);
                    return;
                }).catch((err) => {
                    reject({ success: false, errors: [ {field: 'target', errors: [err] } ] });
                    return;
                });
        });
    }

    periodData(data: any, ctx: IAppModels): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            that._chart.findById(data.chart[0])
                .populate({ path: 'kpis' })
                .then((chart) => {
                    that.chartInfo = chart;
                    that.isStacked = ((chart.chartDefinition.chart.type === 'column') &&
                        (chart.groupings[0] === chart.xAxisSource)) ?
                        true : false;

                    let kpi = KpiFactory.getInstance(chart.kpis[0], ctx);
                    if (that.isStacked) {
                        let options = {
                            filter: chart.filter,
                            groupings: [chart.groupings[0] + '.name'],
                            stackName: data.stackName || null
                        };
                        kpi.getTargetData(that.getDate(data.period), options).then((response) => {
                            resolve(response);
                        }).catch((err) => {
                            reject(err);
                        });
                    } else {
                        let options = {
                            filter: chart.filter
                        };
                        kpi.getData(that.getDate(data.period), options).then((response) => {
                            resolve(response);
                        }).catch((err) => {
                            reject(err);
                        });
                    }
                });
        });
    }

    caculateFormat(data: any, ctx: IAppModels): Promise<any> {

        return new Promise((resolve, reject) => {
            this.periodData(data, ctx)
                .then((response) => {
                    let dataAmount = parseFloat(data.amount);
                    let responseValue = response[0].value;
                    switch (data.vary) {

                        case 'fixed':
                            return resolve(dataAmount);

                        case 'increase':
                            switch (data.amountBy) {
                                case 'percent':
                                    let increasePercentResult = responseValue + (responseValue * (dataAmount / 100) );
                                    return resolve(increasePercentResult);

                                case 'dollar':
                                    let increaseDollarResult = responseValue + dataAmount;
                                    return resolve(increaseDollarResult);

                            }
                        case 'decrease':
                            switch (data.amountBy) {
                                case 'percent':
                                    let decreasePercentResult = responseValue - (responseValue * (dataAmount / 100) );
                                    return resolve(decreasePercentResult);

                                case 'dollar':
                                    let descreaseDollarResult = responseValue - dataAmount;
                                    return resolve(descreaseDollarResult);

                            }
                    }
                });
        });
    }

    getDate(period: string): IDateRange {
        return parsePredifinedDate(period);
    }
}