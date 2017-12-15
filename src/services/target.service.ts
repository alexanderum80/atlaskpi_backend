import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as moment from 'moment';

import { getGroupingMetadata } from '../app_modules/charts/queries/chart-grouping-map';
import { KpiFactory } from '../app_modules/kpis/queries/kpi.factory';
import { Charts } from '../domain/app/charts/chart.model';
import { Users } from '../domain/app/security/users/user.model';
import { ITargetDocument } from '../domain/app/targets/target';
import { Targets } from '../domain/app/targets/target.model';
import { IDateRange, parsePredifinedDate } from '../domain/common/date-range';
import { FrequencyEnum } from '../domain/common/frequency-enum';
import { field } from '../framework/decorators/field.decorator';



// TODO: REFACTOR, and prepare for dependency injection

@injectable()
export class TargetService {

    chartInfo: any;
    isStacked: any;

    constructor(@inject('Users') private _users: Users,
                @inject(KpiFactory.name) private _kpiFactory: KpiFactory,
                @inject('Targets') private _targets: Targets,
                @inject('Charts') private _charts: Charts) { }

    getTargets(chartId: string, userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._targets.model.findUserVisibleTargets(chartId, userId)
                .then((targets) => {
                    resolve(targets);
                    return;
                }).catch((err) => {
                    reject({ success: false, errors: [ {field: 'target', errors: [err] } ] });
                    return;
                });
        });
    }

    periodData(data: any): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            that._charts.model.findById(data.chart[0])
                .populate({ path: 'kpis' })
                .then((chart) => {
                    that.chartInfo = chart;
                    that.isStacked = ((chart.chartDefinition.chart.type === 'column') &&
                        (chart.groupings[0] === chart.xAxisSource)) ?
                        true : false;

                    let kpi = that._kpiFactory.getInstance(chart.kpis[0]);
                    let groupings = getGroupingMetadata(chart, chart.groupings ? chart.groupings : []);
                    if (that.isStacked) {
                        let optionsStack = {
                            filter: chart.filter,
                            groupings: groupings,
                            stackName: data.stackName || null
                        };

                        if (data.period) {
                            kpi.getTargetData([that.getDate(data.period)], optionsStack).then((response) => {
                                resolve(response);
                            }).catch((err) => {
                                reject(err);
                            });
                        } else {
                            resolve([{ value: 0}]);
                        }
                    } else {

                        let optionsNonStack = {
                            filter: chart.filter
                        };
                        switch (data.nonStackName) {
                            case 'all':
                            case 'All':
                                if (data.period) {
                                    kpi.getData([that.getDate(data.period)], optionsNonStack).then((response) => {
                                        resolve(response);
                                    }).catch((err) => {
                                        reject(err);
                                    });
                                } else {
                                    resolve([{ value: 0}]);
                                }
                                break;
                            default:
                                if (data.period) {
                                    optionsNonStack['stackName'] = data.nonStackName;
                                    optionsNonStack['groupings'] = groupings;
                                    kpi.getTargetData([that.getDate(data.period)], optionsNonStack).then((response) => {
                                        resolve(response);
                                    }).catch((err) => {
                                        reject(err);
                                    });
                                } else {
                                    resolve([{ value: 0}]);
                                }
                                break;
                        }
                    }
                });
        });
    }

    caculateFormat(data: any): Promise<any> {

        return new Promise((resolve, reject) => {
            this.periodData(data)
                .then((response) => {
                    let dataAmount = parseFloat(data.amount);
                    let findValue = response.find(r => r.value);
                    let responseValue = findValue ? findValue.value : 0;
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
        }
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