import { IAppModels } from '../../models/app/app-models';
import { IChartModel, IGetChartInput } from '../../models/app/charts/index';
import { KpiFactory } from '../../queries/app/kpis/index';
import { FrequencyEnum, IChartDateRange, IDateRange, parsePredifinedDate } from '../../models/common/index';
import { ITargetDocument, ITargetModel } from '../../models/app/targets/ITarget';
import { IUserModel } from '../../models/app/users/index';
import * as Promise from 'bluebird';
import * as moment from 'moment';


export class TargetService {

    chartInfo: any;
    isStacked: any;

    constructor(private _user: IUserModel,
                private _target: ITargetModel,
                private _chart: IChartModel) { }

    getTargets(chartId: string, userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._target.findUserVisibleTargets(chartId, userId)
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

                        if (data.period) {
                            kpi.getTargetData([that.getDate(data.period)], options).then((response) => {
                                resolve(response);
                            }).catch((err) => {
                                reject(err);
                            });
                        } else {
                            resolve([{ value: 0}]);
                        }
                    } else {
                        let options = {
                            filter: chart.filter
                        };

                        if (data.period) {
                            kpi.getData([that.getDate(data.period)], options).then((response) => {
                                resolve(response);
                            }).catch((err) => {
                                reject(err);
                            });
                        } else {
                            resolve([{ value: 0}]);
                        }
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

    static formatFrequency(frequency: number, targetDate: string) {
        switch (frequency) {
            case FrequencyEnum.Monthly:
                return moment(targetDate).format('YYYY-MM');
            case FrequencyEnum.Yearly:
                return moment(targetDate).format('YYYY');
            case FrequencyEnum.Quartely:
                return moment(targetDate).format('YYYY') + '-Q' + moment(targetDate).format('Q');
            case FrequencyEnum.Daily:
                return moment(targetDate).format('YYYY-MM-DD');
            case FrequencyEnum.Weekly:
                return moment(targetDate).isoWeek();
        };
    }

    static futureTargets(targets: ITargetDocument[]) {
        let futureDateRange;
        if (targets && targets.length) {
            targets.forEach((target) => {
                const datepicker = moment(target.datepicker).format('YYYY-MM-DD');
                const currentYear = moment().endOf('year').format('YYYY-MM-DD');
                if (moment(datepicker).isAfter(currentYear)) {
                    futureDateRange = {
                        from: moment().add(1, 'year').startOf('year').toDate(),
                        to: moment().add(1, 'year').endOf('year').toDate()
                    };
                }
            });
            return futureDateRange;
        }
    }
}