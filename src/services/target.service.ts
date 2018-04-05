import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';
import * as moment from 'moment';

import { IGetDataOptions, IKpiBase } from '../app_modules/kpis/queries/kpi-base';
import { KpiFactory } from '../app_modules/kpis/queries/kpi.factory';
import { IChartDocument } from '../domain/app/charts/chart';
import { Charts } from '../domain/app/charts/chart.model';
import { Users } from '../domain/app/security/users/user.model';
import { ITarget, ITargetDocument } from '../domain/app/targets/target';
import { Targets } from '../domain/app/targets/target.model';
import {
    IDateRange,
    parsePredefinedTargetDateRanges,
    parsePredifinedDate,
    PredefinedDateRanges,
} from '../domain/common/date-range';
import { FrequencyEnum, FrequencyTable } from '../domain/common/frequency-enum';
import { field } from '../framework/decorators/field.decorator';

export interface IMomentFrequencyTable {
    daily: string;
    weekly: string;
    monthly: string;
    quartely: string;
    yearly: string;
}
const MomentFrequencyTable: IMomentFrequencyTable = {
    daily: 'day',
    weekly: 'week',
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
    datepicker?: string;
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
                    that.frequentlyUpdateTargets(targets).then((updatedTargets: ITargetDocument[]) => {
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

    frequentlyUpdateTargets(targets: ITargetDocument[]): Promise<ITargetDocument[]> {
        const that = this;

        return new Promise<ITargetDocument[]>((resolve, reject) => {
            if (!targets || !targets.length) {
                resolve(targets);
                return;
            }

            Bluebird.map(targets, (target: ITargetDocument) => that.updateTarget(target))
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

    async getBaseValue(data: ITargetCalculateData): Promise<any> {
        const chart = await this._charts.model.findById(data.chart[0])
            .populate({ path: 'kpis' });
        const kpi: IKpiBase = await this._kpiFactory.getInstance(chart.kpis[0]);
        const groupings: string[] = chart.groupings || [];
        const chartDateRange: string = chart.dateRange ? chart.dateRange[0].predefined : '';
        const targetDateRange: IDateRange = this.getDate(data.period, data.datepicker, chart.frequency, chartDateRange);
        let getDataOptions: IGetDataOptions;

        if (!data.period) {
            return [{ value: 0 }];
        }

        if (chart.isStacked()) {
            getDataOptions = {
                filter: chart.filter,
                groupings: groupings,
                stackName: this.getComparisonStackName(chart, data).name || null
            };
        } else if (Array.isArray(groupings)) {
            getDataOptions = { filter: chart.filter };
        } else {
            getDataOptions = { filter: chart.filter };

            if (data.nonStackName.toLocaleLowerCase() !== 'all') {
                getDataOptions.stackName = this.getComparisonStackName(chart, data).name;
                getDataOptions.groupings = groupings;
            }
        }

        return await kpi.getData([targetDateRange], getDataOptions);
    }

    caculateFormat(data: ITargetCalculateData): Promise<number> {

        return new Promise<number>((resolve, reject) => {
            this.getBaseValue(data)
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


    async getTargetMet(input: ITargetMet) {
        const that = this;

        if (input.period) {
            return [{ value: 0}];
        }

        // get kpi from the chart with input.chart[0]
        const chart = await that._charts.model.findById(input.chart[0])
            .populate({ path: 'kpis' });

        if (this.isTargetReachZero(chart.frequency, input.datepicker, input.notificationDate)) {
            return 0;
        }
        const kpi: IKpiBase = await that._kpiFactory.getInstance(chart.kpis[0]);
        const getDateRange: IDateRange = that._getDateRange(
                input.period,
                input.notificationDate,
                chart.frequency
        );

        // change 'to' property to now timestamp
        if (getDateRange && getDateRange.to) {
            getDateRange.to = moment().toDate();
        }

        const groupings: string[] = chart.groupings || [];
        const stackName: string = input.stackName ? input.stackName : input.nonStackName;
        const isStackNameEqualToAll: boolean = stackName.toLowerCase() === 'all';

        const chartDateRange: string = chart.dateRange ? chart.dateRange[0].predefined : '';
        const dateRange: any = getDateRange || parsePredifinedDate(chartDateRange);

        const options: IGetDataOptions = {
            filter: chart.filter
        };

        if (!groupings || !groupings.length || !groupings[0]) {
            Object.assign(options, { 
                filter: chart.filter
            });
        } else if (!isStackNameEqualToAll) {
            Object.assign(options, {
                groupings: groupings,
                stackName: stackName
            });
        }

        const response = await kpi.getData([dateRange], options);
        const findValue = response ? response.find(r => r.value) : { value: input.amount };
        const responseValue: number = findValue ? findValue.value : 0;

        return responseValue;
    }

    // return object with 'from' and 'to' property
    getDate(period: string, dueDate: string, chartFrequency: string, alternateDatePeriod: string): IDateRange {
        return parsePredefinedTargetDateRanges(period, dueDate, chartFrequency) || parsePredifinedDate(alternateDatePeriod);
    }

    isComparison(chart: IChartDocument): boolean {
        if (!chart) { return false; }
        return (chart.comparison && chart.comparison.length) ? true : false;
    }

    isTargetReachZero(chartFrequency: string, datepicker: string, notificationDate: string): any {
        const now = moment();
        const dueDate = moment(datepicker, 'MM/DD/YYYY');
        let diff;

        switch (chartFrequency) {
            case 'daily':
                diff = moment().diff(dueDate);
                break;
            case 'weekly':
                const weekly = moment().week();
                const weeklyDate = moment(dueDate).week();
                diff = weeklyDate - weekly;
                break;
            case 'monthly':
                const monthly = moment().month();
                const monthlyDate = moment(dueDate).month();
                diff = monthlyDate - monthly;
                break;
            case 'quartely':
                const quarter = moment().quarter();
                const quarterDate = moment(dueDate).quarter();
                diff = quarterDate - quarter;
                break;
            case 'yearly':
                const year = moment().year();
                const yearlyDate = moment(dueDate).year();
                diff = yearlyDate - year;
                break;
        }

        if (diff) {
            return true;
        }
        return false;
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
}