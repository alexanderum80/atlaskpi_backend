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
import {IDateRange, parsePredifinedDate, PredefinedDateRanges, parsePredefinedTargetDateRanges} from '../domain/common/date-range';
import {FrequencyEnum, FrequencyTable} from '../domain/common/frequency-enum';
import {field} from '../framework/decorators/field.decorator';
import {IChartDocument} from '../domain/app/charts/chart';

export interface IMomentFrequencyTable {
    daily: string;
    weekly: string;
    monthly: string;
    quartely: string;
    yearly: string;
}
const MomentFrequencyTable: IMomentFrequencyTable = {
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'month',
    quartely: 'quarter',
    yearly: 'year',
};

export interface IPeriodAmount {
    value: number;
}

export interface IGetComparisonStackName {
    name?: string;
    comparisonString?: string;
}

export interface ITargetCalculateData {
    amount?: number|string;
    stackName?: string;
    nonStackName?: string;
    amountBy?: string;
    chart?: string[];
    period?: string;
    vary?: string;
    datepicker?: string;
}

export interface ITargetMet {
    amount?: number|string;
    period?: string;
    notificationDate?: string;
    stackName?: string;
    nonStackName?: string;
    chart?: string[];
}


@injectable()
export class TargetService {
    isStacked: boolean;

    constructor(@inject(Users.name) private _users: Users,
                @inject(KpiFactory.name) private _kpiFactory: KpiFactory,
                @inject(Targets.name) private _targets: Targets,
                @inject(Charts.name) private _charts: Charts) { }

    getTargets(chartId: string, userId: string): Promise<ITargetDocument[]> {
        const that = this;

        return new Promise<ITargetDocument[]>((resolve, reject) => {
            this._targets.model.findUserVisibleTargets(chartId, userId)
                .then((targets: ITargetDocument[]) => {
                    that.dailyUpdateTargets(targets).then((updatedTargets: ITargetDocument[]) => {
                        resolve(updatedTargets);
                        return;
                    }).catch(err => {
                        reject(err);
                        return;
                    });
                }).catch((err) => {
                    reject({ success: false, errors: [ {field: 'target', errors: [err] } ] });
                    return;
                });
        });
    }

    dailyUpdateTargets(targets: ITargetDocument[]): Promise<ITargetDocument[]> {
        // check if a day has past to update targets
        // if day past, update targets
        // return targets
        const that = this;

        return new Promise<ITargetDocument[]>((resolve, reject) => {
            if (!targets || !targets.length) {
                resolve(targets);
                return;
            }

            Promise.map(targets, (target: ITargetDocument) => that.updateTarget(target))
                .then((updatedTargets: ITargetDocument[]) => {
                    resolve(updatedTargets);
                    return;
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    updateTarget(target: ITargetDocument): Promise<ITargetDocument> {
        const that = this;

        return new Promise<ITargetDocument>((resolve, reject) => {
            const id: string = target.id;
            const inputData: ITarget = Object.assign({}, target.toObject() as ITarget);

            that.caculateFormat(inputData).then((targetAmount: number) => {
                inputData.target = targetAmount;
                inputData.timestamp = new Date();

                that._targets.model.updateTarget(id, inputData).then((updatedTarget: ITargetDocument) => {
                    resolve(updatedTarget);
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }

    periodData(data: ITargetCalculateData): Promise<IPeriodAmount[]> {
        const that = this;

        return new Promise<IPeriodAmount[]>((resolve, reject) => {
            that._charts.model.findById(data.chart[0])
                .populate({ path: 'kpis' })
                .then((chart: IChartDocument) => {
                    // check if is a stacked chart
                    that.isStacked = that._stacked(chart);

                    const kpi: IKpiBase = that._kpiFactory.getInstance(chart.kpis[0]);
                    const groupings: string[] = getGroupingMetadata(chart, chart.groupings ? chart.groupings : []);

                    // get the predefined date range from chart
                    const chartDateRange: string = chart.dateRange ? chart.dateRange[0].predefined : '';
                    const targetDateRange: IDateRange = that.getDate(data.period, data.datepicker, chart.frequency, chartDateRange);

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
                            stackName: this.getComparisonStackName(chart, data).name || null
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
                                break;
                            default:
                                if (data.period) {
                                    optionsNonStack['stackName'] = this.getComparisonStackName(chart, data).name;
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
                                break;
                        }
                    }
                });
        });
    }

    caculateFormat(data: ITargetCalculateData): Promise<number> {

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


    getTargetMet(input: ITargetMet) {
        const that = this;

        return new Promise<any>((resolve, reject) => {

            // get kpi from the chart with input.chart[0]
            that._charts.model.findById(input.chart[0])
                .populate({ path: 'kpis' })
                .then((chart) => {
                    const kpi: IKpiBase = that._kpiFactory.getInstance(chart.kpis[0]);
                    const getDateRange: IDateRange = that._getDateRange(
                            input.period,
                            input.notificationDate,
                            chart.frequency
                    );

                    // change 'to' property to now timestamp
                    if (getDateRange && getDateRange.to) {
                        getDateRange.to = moment().toDate();
                    }

                    const groupings: string[] = getGroupingMetadata(chart, chart.groupings ? chart.groupings : []);

                    const stackName: string = input.stackName ? input.stackName : input.nonStackName;
                    const isStackNameEqualToAll: boolean = stackName.toLowerCase() === 'all';

                    const chartDateRange: string = chart.dateRange ? chart.dateRange[0].predefined : '';
                    const dateRange: any = getDateRange || parsePredifinedDate(chartDateRange);

                    const options: IGetDataOptions = {
                        filter: chart.filter
                    };

                    if (!groupings || !groupings.length || !groupings[0]) {
                        if (input.period) {
                            kpi.getData([dateRange], { filter: chart.filter})
                                .then(response => {
                                    const findValue = response ? response.find(r => r.value) : { value: input.amount };
                                    const responseValue: number = findValue ? findValue.value : 0;

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
                            const responseValue: number = findValue ? findValue.value : 0;

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
    getDate(period: string, dueDate: string, chartFrequency: string, alternateDatePeriod: string): IDateRange {
        return parsePredefinedTargetDateRanges(period, dueDate, chartFrequency);
    }

    isComparison(chart: IChartDocument): boolean {
        if (!chart) { return false; }
        return (chart.comparison && chart.comparison.length) ? true : false;
    }

    getComparisonStackName(chart: IChartDocument, data: any): IGetComparisonStackName {
        const targetName: string = data.stackName || data.nonStackName;

        if (!targetName || !this.isComparison(chart)) {
            return {
                name: targetName
            };
        }

        const comparisonString = chart.comparison.find(c => c !== undefined);
        // i.e. (this year)
        const comparisonPeriod: string = `(${comparisonString})`;
        const definedDateRanges = PredefinedDateRanges;

        // i.e Product, Botox
        let groupingName: string = targetName.replace(comparisonPeriod, '');
        groupingName = chart.dateRange[0].predefined === comparisonString ? groupingName : targetName;


        for (let i in definedDateRanges) {
            groupingName = groupingName.replace(`(${PredefinedDateRanges[i]})`, '');
        }

        return {
            name: groupingName,
            comparisonString: comparisonString
        };
    }

    static formatFrequency(frequency: number, targetDate: string): string|number {
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
                return moment(targetDate).week() - 1;
        }
    }

    static futureTargets(targets: ITargetDocument[]): IDateRange {
        let futureDateRange: IDateRange;

        if (targets && targets.length) {
            targets.forEach((target: ITargetDocument) => {
                const datepicker: string = moment(target.datepicker).format('YYYY-MM-DD');
                const currentYear: string = moment().endOf('year').format('YYYY-MM-DD');
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

    private _getDateRange(period: string, notify: any, frequency: string): IDateRange {
        const dateFrequency: number = FrequencyTable[frequency];

        switch (dateFrequency) {
            case FrequencyTable.daily:
                return parsePredifinedDate(PredefinedDateRanges.today);
            case FrequencyTable.weekly:
                return parsePredifinedDate(PredefinedDateRanges.thisWeekToDate);
            case FrequencyTable.monthly:
                return parsePredifinedDate(PredefinedDateRanges.thisMonthToDate);
            case FrequencyTable.quartely:
                return parsePredifinedDate(PredefinedDateRanges.thisQuarterToDate);
            case FrequencyTable.yearly:
                return parsePredifinedDate(PredefinedDateRanges.thisYearToDate);
            default:
                return {
                    from: moment(notify, 'MM/DD/YYYY').startOf(MomentFrequencyTable[frequency]).toDate(),
                    to: moment().toDate()
                };
        }

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