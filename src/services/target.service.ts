import { IGetDataOptions, IKpiBase } from '../app_modules/kpis/queries/kpi-base';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as moment from 'moment';

import { getGroupingMetadata } from '../app_modules/charts/queries/chart-grouping-map';
import { KpiFactory } from '../app_modules/kpis/queries/kpi.factory';
import { Charts } from '../domain/app/charts/chart.model';
import { Users } from '../domain/app/security/users/user.model';
import { ITarget, ITargetDocument } from '../domain/app/targets/target';
import { Targets } from '../domain/app/targets/target.model';
import { IDateRange, parsePredifinedDate } from '../domain/common/date-range';
import { FrequencyEnum } from '../domain/common/frequency-enum';
import { field } from '../framework/decorators/field.decorator';

const MomentFrequencyTable = {
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'month',
    quartely: 'quarter',
    yearly: 'year',
};

export interface IPeriodAmount {
    value: number;
}


@injectable()
export class TargetService {
    isStacked: boolean;

    constructor(@inject(Users.name) private _users: Users,
                @inject(KpiFactory.name) private _kpiFactory: KpiFactory,
                @inject(Targets.name) private _targets: Targets,
                @inject(Charts.name) private _charts: Charts) { }

    getTargets(chartId: string, userId: string): Promise<ITargetDocument[]> {
        return new Promise<ITargetDocument[]>((resolve, reject) => {
            this._targets.model.findUserVisibleTargets(chartId, userId)
                .then((targets: ITargetDocument[]) => {
                    resolve(targets);
                    return;
                }).catch((err) => {
                    reject({ success: false, errors: [ {field: 'target', errors: [err] } ] });
                    return;
                });
        });
    }

    periodData(data: ITarget): Promise<IPeriodAmount[]> {
        const that = this;

        return new Promise<IPeriodAmount[]>((resolve, reject) => {
            that._charts.model.findById(data.chart[0])
                .populate({ path: 'kpis' })
                .then((chart) => {
                    // check if is a stacked chart
                    that.isStacked = that._stacked(chart);

                    const kpi: IKpiBase = that._kpiFactory.getInstance(chart.kpis[0]);
                    const groupings: string[] = getGroupingMetadata(chart, chart.groupings ? chart.groupings : []);

                    // get the predefined date range from chart
                    const chartDateRange: string = chart.dateRange ? chart.dateRange[0].predefined : '';
                    const targetDateRange: IDateRange = that.getDate(data.period, chartDateRange);

                    // check if the chart has no groupings
                    if (!that.isStacked && (!groupings || !groupings.length || !groupings[0])) {
                        if (data.period) {
                            kpi.getData([targetDateRange], { filter: chart.filter})
                                .then(response => {
                                    resolve(response);
                                    return;
                                }).catch(err => {
                                    reject(err);
                                    return;
                                });
                        } else {
                            resolve([{ value: 0}]);
                            return;
                        }
                    } else if (that.isStacked) {
                        // check if the chart is stacked
                        const optionsStack: IGetDataOptions = {
                            filter: chart.filter,
                            groupings: groupings,
                            stackName: data.stackName || null
                        };

                        if (data.period) {
                            kpi.getData([targetDateRange], optionsStack).then((response) => {
                                resolve(response);
                                return;
                            }).catch((err) => {
                                reject(err);
                                return;
                            });
                        } else {
                            resolve([{ value: 0}]);
                            return;
                        }
                    } else {

                        let optionsNonStack: IGetDataOptions = {
                            filter: chart.filter
                        };
                        switch (data.nonStackName) {
                            case 'all':
                            case 'All':
                                if (data.period) {
                                    kpi.getData([targetDateRange], optionsNonStack).then((response) => {
                                        resolve(response);
                                        return;
                                    }).catch((err) => {
                                        reject(err);
                                        return;
                                    });
                                } else {
                                    resolve([{ value: 0}]);
                                    return;
                                }
                            default:
                                if (data.period) {
                                    optionsNonStack['stackName'] = data.nonStackName;
                                    optionsNonStack['groupings'] = groupings;

                                    kpi.getData([targetDateRange], optionsNonStack).then((response) => {
                                        resolve(response);
                                        return;
                                    }).catch((err) => {
                                        reject(err);
                                        return;
                                    });
                                } else {
                                    resolve([{ value: 0}]);
                                    return;
                                }
                        }
                    }
                });
        });
    }

    caculateFormat(data: ITarget): Promise<number> {

        return new Promise<number>((resolve, reject) => {
            this.periodData(data)
                .then((response: any) => {
                    const dataAmount: number = parseFloat(data.amount.toString());
                    const findValue = response ? response.find(r => r.value) : { value: data.amount };

                    const responseValue: number = findValue ? findValue.value : 0;

                    switch (data.vary) {

                        case 'fixed':
                            return resolve(dataAmount);

                        case 'increase':
                            switch (data.amountBy) {
                                case 'percent':
                                    const increasePercentResult: number = responseValue + (responseValue * (dataAmount / 100) );
                                    return resolve(increasePercentResult);

                                case 'dollar':
                                    const increaseDollarResult: number = responseValue + dataAmount;
                                    return resolve(increaseDollarResult);

                            }
                        case 'decrease':
                            switch (data.amountBy) {
                                case 'percent':
                                    const decreasePercentResult: number = responseValue - (responseValue * (dataAmount / 100) );
                                    return resolve(decreasePercentResult);

                                case 'dollar':
                                    const descreaseDollarResult: number = responseValue - dataAmount;
                                    return resolve(descreaseDollarResult);

                            }
                    }
                });
        });
    }


    getTargetMet(input: any) {
        const that = this;

        return new Promise<any>((resolve, reject) => {

            // get kpi from the chart with input.chart[0]
            that._charts.model.findById(input.chart[0])
                .populate({ path: 'kpis' })
                .then((chart) => {
                    const kpi = that._kpiFactory.getInstance(chart.kpis[0]);
                    const getDateRange = that._getDateRange(
                            input.notificationDate,
                            MomentFrequencyTable[chart.frequency]
                    );

                    const groupings: string[] = getGroupingMetadata(chart, chart.groupings ? chart.groupings : []);

                    const stackName: string = input.stackName ? input.stackName : input.nonStackName;
                    const isStackNameEqualToAll: boolean = stackName.toLowerCase() === 'all';

                    const chartDateRange = chart.dateRange ? chart.dateRange[0].predefined : '';
                    const targetDateRange = that.getDate(input.period, chartDateRange);

                    const dateRange: any = getDateRange || chartDateRange;

                    const options: IGetDataOptions = {
                        filter: chart.filter
                    };

                    if (!groupings || !groupings.length || !groupings[0]) {
                        if (input.period) {
                            kpi.getData([targetDateRange], { filter: chart.filter})
                                .then(response => {
                                    const findValue = response ? response.find(r => r.value) : { value: input.amount };
                                    const responseValue = findValue ? findValue.value : 0;

                                    resolve(responseValue);
                                    return;
                                }).catch(err => reject(err));
                        } else {
                            resolve([{ value: 0}]);
                            return;
                        }
                    } else {
                        if (!isStackNameEqualToAll) {
                            Object.assign(options, {
                                groupings: groupings,
                                stackName: stackName
                            });
                        }

                        kpi.getData([dateRange], options).then(data => {
                            const findValue = data ? data.find(r => r.value) : { value: input.amount };
                            const responseValue = findValue ? findValue.value : 0;

                            resolve(responseValue);
                            return;
                        }).catch(err => {
                            reject(err);
                            return;
                        });
                    }
                });
        });
    }

    // return object with 'from' and 'to' property
    // use chart date range if period is undefined, empty, or has no value
    getDate(period: string, alternateDatePeriod: string): IDateRange {
        return parsePredifinedDate(period) || parsePredifinedDate(alternateDatePeriod);
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

    static futureTargets(targets: ITargetDocument[]): IDateRange {
        let futureDateRange: IDateRange;

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

    private _getDateRange(notify: any, frequency: any) {
        return {
            from: moment(notify, 'MM/DD/YYYY').startOf(frequency).toDate(),
            to: moment(notify, 'MM/DD/YYYY').toDate()
        };
    }

    private _stacked(chart: any): boolean {
        return ((chart.chartDefinition.chart.type === 'column') &&
                Array.isArray(chart.groupings) &&
                chart.groupings && chart.xAxisSource &&
                (chart.groupings[0] === chart.xAxisSource)) ||
                (Array.isArray(chart.groupings) &&
                 chart.groupings.length && !chart.frequency && !chart.xAxisSource);
    }
}