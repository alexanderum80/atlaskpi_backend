import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';
import * as moment from 'moment';

import { IGetDataOptions, IKpiBase } from '../app_modules/kpis/queries/kpi-base';
import { KpiFactory } from '../app_modules/kpis/queries/kpi.factory';
import { IChartDocument, IChart } from '../domain/app/charts/chart';
import { Charts } from '../domain/app/charts/chart.model';
import { Dashboards } from '../domain/app/dashboards/dashboard.model';
import { Users } from '../domain/app/security/users/user.model';
import { ITargetNew, ITargetNewDocument, TargetCompareToEnum } from '../domain/app/targetsNew/target';
import { TargetsNew } from '../domain/app/targetsNew/target.model';
import {
    IChartDateRange,
    IDateRange,
    parsePredefinedTargetDateRanges,
    parsePredefinedDate,
    PredefinedDateRanges,
} from '../domain/common/date-range';
import { FrequencyEnum, FrequencyTable } from '../domain/common/frequency-enum';
import { TargetNotification } from './notifications/users/target.notification';
import { PnsService } from './pns.service';
import { DateService } from './date/date-service';

export interface IMomentFrequencyTable {
    daily: string;
    weekly: string;
    monthly: string;
    quarterly: string;
    yearly: string;
}
const MomentFrequencyTable: IMomentFrequencyTable = {
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
    quarterly: 'quarter',
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
                @inject(TargetsNew.name) private _targets: TargetsNew,
                @inject(Charts.name) private _charts: Charts,
                @inject(Dashboards.name) private _dashboard: Dashboards,
                @inject(TargetNotification.name) private _targetNotification: TargetNotification,
                @inject(PnsService.name) private _pnsService: PnsService,
                @inject(DateService.name) private dateService: DateService,
    ) { }

    async getTargets(chartId: string, userId: string): Promise<ITargetNewDocument[]> {
        try {
            const visibleTargets: ITargetNewDocument[] =
                await this._targets.model.findUserVisibleTargets(chartId, userId);
            return await this.frequentlyUpdateTargets(visibleTargets);
        } catch (err) {
            return ({
                success: false,
                errors: [ { field: 'target', errors: [err] }]
            }) as any;
        }
    }

    async frequentlyUpdateTargets(targets: ITargetNewDocument[]): Promise<ITargetNewDocument[]> {
        try {
            if (!targets || !targets.length) {
                return targets;
            }

            const updatedListTargets: ITargetNewDocument[] = await Bluebird.map(
                                        targets,
                                        (target: ITargetNewDocument) => this.updateTarget(target)
                                    );
            return updatedListTargets;
        } catch (err) {
            throw new Error('unable to update all targets');
        }
    }


    async updateTarget(target: ITargetNewDocument): Promise<ITargetNewDocument> {
        try {
            const id: string = target._id;
            const inputData: ITargetNew = Object.assign({}, target.toObject());

            const targetAmount: number = await this.getTargetValue(inputData);
            inputData.targetValue = targetAmount;
            inputData.timestamp = new Date();

            const updatedTarget: ITargetNewDocument =
                await this._targets.model.updateTargetNew(id, inputData);

            const targetProgress: number = await this.targetProgressValue(updatedTarget);
            updatedTarget.percentageCompletion = (targetProgress / inputData.targetValue) * 100;

            return updatedTarget;
        } catch (err) {
            throw new Error('unable to update target');
        }
    }

    async targetProgressValue(data: ITargetNewDocument): Promise<number> {
        try {
            const chart: IChart = await this._charts.model.findById(data.source.identifier)
                .populate({ path: 'kpis' })
                .lean(true)
                .exec() as IChart;
            const kpi: IKpiBase = await this._kpiFactory.getInstance(chart.kpis[0]);

            const groupings: string[] = (chart.groupings && chart.groupings[0]) ? chart.groupings : [];
            const stackName: string = !data.appliesTo ? undefined : data.appliesTo.value;

            // const dr = parsePredefinedDate(data.period);
            // const dateRange: IDateRange[] = this._getTargetProgressDateRange(chart.frequency, dr.to, chart.dateRange);

            const dateRange: IDateRange = this.getDate(
                chart.dateRange[0],
                data.reportOptions.frequency
            );

            const options: IGetDataOptions = {
                filter: chart.filter
            };

            if (!groupings || !groupings.length || !groupings) {
                Object.assign(options, {
                    filter: chart.filter
                });
            } else {
                if (data.appliesTo) {
                    Object.assign(options, {
                        groupings: groupings,
                        stackName: this.getStackName(chart, stackName).name || null
                    });
                }
            }

            const response = await kpi.getData([dateRange], options);
            const totalProgress = response ? response.find(r => r.value) : { value : data.targetValue };
            const amount: number = totalProgress ? totalProgress.value : 0;

            return amount;
        } catch (err) {
            throw new Error('error getting target progress');
        }
    }

    // async createUpdateTarget(data: ITargetNew, id?: string): Promise<ITargetNewDocument> {
    //     try {
    //         // target value
    //         data.target = await this.getTargetValue(data);

    //         if (!id) {
    //             // create target
    //             return await this._targets.model.createNew(data);
    //         } else {
    //             // update target
    //             return await this._targets.model.updateTargetNew(id, data);
    //         }

    //     } catch (err) {
    //         throw new Error('unable to modify target');
    //     }
    // }

    async getTargetValue(data: ITargetNew): Promise<number> {
        try {
            const response = await this.getBaseValue(data);
            const findValue = data.appliesTo
                ? response.find(r => r._id[data.appliesTo.field] === data.appliesTo.value)
                : response.find(r => r.value);

            const responseValue: number = findValue ? findValue.value : 0;

            switch (data.type) {
                case 'fixed':
                    return responseValue;
                case 'increase':
                    return data.unit === '%'
                        ? responseValue * (1 + (data.value / 100))
                        : responseValue + data.value;
                case 'decrease':
                    return data.unit === '%'
                        ? responseValue - (responseValue * (data.value / 100))
                        : responseValue - data.value;
            }
        } catch (err) {
            throw new Error('unable to calculate target amount');
        }
    }

    async getBaseValue(data: ITargetNew): Promise<any> {
        const chart: IChart = await this._charts.model.findById(data.source.identifier)
            .populate({ path: 'kpis' })
            .lean(true).exec() as any;
        const kpi: IKpiBase = await this._kpiFactory.getInstance(chart.kpis[0]);

        if (data.type === 'fixed') return data.targetValue;

        const compareDateRange = this.getCompareDateRange(
            chart.dateRange[0],
            data.compareTo,
            data.reportOptions.frequency
        );

        let getDataOptions: IGetDataOptions = {
            dateRange: chart.dateRange,
            frequency: this.dateService.getFrequency(data.reportOptions.frequency),
            groupings: data.reportOptions.groupings,
            top: data.reportOptions.top,
        };

        return await kpi.getData([compareDateRange], getDataOptions);
    }

    private getCompareDateRange(dateRange: IChartDateRange, compareTo: string, frequency: string): IDateRange {
        if (compareTo === 'previous period') {
            return this.dateService.getPreviousPeriod(dateRange);
        }

        if (frequency) {
            let date: moment.Moment;

            switch (compareTo) {
                case TargetCompareToEnum.previous:
                    const duration = this.dateService.convertFrequencyToDuration(frequency);
                    date = moment().subtract(1, duration);
                    break;
                case TargetCompareToEnum.oneYearAgo:
                    date = moment().subtract(1, 'year');
                    break;
                case TargetCompareToEnum.twoYearsAgo:
                    date = moment().subtract(2, 'year');
                    break;
                case TargetCompareToEnum.threeYearsAgo:
                    date = moment().subtract(3, 'year');
                    break;
            }

            // if (compareTo.indexOf('last') !== -1) {
            //     const duration = this.dateService.convertFrequencyToDuration(frequency);
            //     date = moment().subtract(1, duration);
            // } else if (compareTo.indexOf('two') !== -1) {
            //     date = moment().subtract(2, 'year');
            // } else if (compareTo.indexOf('three') !== -1) {
            //     date = moment().subtract(3, 'year');
            // }

            return this.dateService.getFrequencyDateRange(dateRange, frequency, date);

        } else {
            // TODO: Need to implement this
        }

    }

    async getTargetMet(input: ITargetMet) {
        const that = this;

        if (!input.period) {
            return 0;
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
        const dateRange: any = getDateRange || parsePredefinedDate(chartDateRange);

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
                stackName: this.getStackName(chart, stackName).name || null
            });
        }

        const response = await kpi.getData([dateRange], options);
        const findValue = response ? response.find(r => r.value) : { value: input.amount };
        const responseValue: number = findValue ? findValue.value : 0;

        return responseValue;
    }

    // async sendNotification(input: NotificationInput): Promise<boolean> {
    //     try {
    //         const chartDoc: IChartDocument = await this._charts.model.findById(input.chartId);
    //         const dashboardName: string = await this._dashboard.model.findDashboardByChartId(input.chartId);
    //         const usersDoc: IUserDocument[] = await this._users.model.findUsersById(input.usersId);

    //         const chart = chartDoc.toObject() as IChart;
    //         const chartDefinition = chart.chartDefinition;

    //         let targetAmount: string;
    //         let targetMet: string;

    //         if (!chartDoc || !dashboardName || !usersDoc) {
    //             throw new Error('inefficient data');
    //         }

    //         targetAmount = this._formatNotificationValue(chartDefinition, input.targetAmount);
    //         targetMet = this._formatNotificationValue(chartDefinition, input.targetMet);

    //         const notifyData: INotificationData = {
    //             targetName: input.targetName,
    //             targetAmount: targetAmount,
    //             targetMet: targetMet,
    //             targetDate: input.targetDate,
    //             dashboardName: dashboardName,
    //             chartName: chartDoc.title,
    //             businessUnitName: input.businessUnit
    //         };

    //         const message = `
    //             This is a notification for the target ${notifyData.targetName} you set for ${notifyData.businessUnitName},
    //             to date you have reached ${notifyData.targetMet} of your targeted ${notifyData.targetAmount} for
    //             ${notifyData.targetDate}. You can access this on your ${notifyData.dashboardName} dashboard on the chart called
    //             ${notifyData.chartName}.
    //         `;
    //         this._pnsService.sendNotifications(usersDoc, message);

    //         usersDoc.forEach(user => this._targetNotification.notify(user, user.username, notifyData));
    //         return true;
    //     } catch (err) {
    //         throw new Error('error getting dashboard name, chart, and users');
    //     }
    // }

    // return object with 'from' and 'to' property
    getDate(chartDateRange: IChartDateRange, frequency?: string): IDateRange {
        return !frequency
            ? this.dateService.getDateRange(chartDateRange)
            : this.dateService.getFrequencyDateRange(chartDateRange, frequency, moment());

        // return parsePredefinedTargetDateRanges(dueDate, chartFrequency) ||
        //         chartDateRange.custom && chartDateRange.custom.from ?
        //            {
        //                 from: moment(chartDateRange.custom.from).startOf('day').toDate(),
        //                 to: moment(chartDateRange.custom.to).startOf('day').toDate()
        //            }
        //            : parsePredefinedDate(chartDateRange.predefined);
    }

    isComparison(chart: IChart): boolean {
        if (!chart) { return false; }
        return (chart.comparison && chart.comparison.length) ? true : false;
    }

    /**
     * check if current time is past dueDate
     * @param chartFrequency
     * @param datepicker
     * @param notificationDate
     */
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
            case 'quarterly':
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

    getStackName(chart: IChart, name: string): IGetComparisonStackName {
        const targetName: string = name || undefined;

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
            case FrequencyEnum.Quarterly:
                return moment(targetDate).format('YYYY') + '-Q' + moment(targetDate).format('Q');
            case FrequencyEnum.Daily:
                return moment(targetDate).format('YYYY-MM-DD');
            case FrequencyEnum.Weekly:
                return moment(targetDate).week() - 1;
            default:
                // no frequency
                return null;
        }
    }

    // static futureTargets(targets: ITargetNewDocument[]): IDateRange {
    //     let futureDateRange: IDateRange;

    //     if (targets && targets.length) {
    //         targets.forEach((target: ITargetNewDocument) => {
    //             const dr = parsePredefinedDate(target.period);
    //             const datepicker: string = moment(dr.to).format('YYYY-MM-DD');
    //             const currentYear: string = moment().endOf('year').format('YYYY-MM-DD');
    //             if (moment(datepicker).isAfter(currentYear)) {
    //                 futureDateRange = {
    //                     from: moment().add(1, 'year').startOf('year').toDate(),
    //                     to: moment().add(1, 'year').endOf('year').toDate()
    //                 };
    //             }
    //         });
    //         return futureDateRange;
    //     }
    // }

    private _getDateRange(period: string, notify: any, frequency: string): IDateRange {
        const dateFrequency: number = FrequencyTable[frequency];

        switch (dateFrequency) {
            case FrequencyTable.daily:
                return parsePredefinedDate(PredefinedDateRanges.today);
            case FrequencyTable.weekly:
                return parsePredefinedDate(PredefinedDateRanges.thisWeekToDate);
            case FrequencyTable.monthly:
                return parsePredefinedDate(PredefinedDateRanges.thisMonthToDate);
            case FrequencyTable.quarterly:
                return parsePredefinedDate(PredefinedDateRanges.thisQuarterToDate);
            case FrequencyTable.yearly:
                return parsePredefinedDate(PredefinedDateRanges.thisYearToDate);
            default:
                return {
                    from: moment(notify, 'MM/DD/YYYY').startOf(MomentFrequencyTable[frequency]).toDate(),
                    to: moment().toDate()
                };
        }

    }

    private _getTargetProgressDateRange(chartFrequency: string, dueDate: Date, chartDateRange: IChartDateRange[]): IDateRange[] {
        const to = moment(dueDate).toDate();
        let from: Date;

        const frequency = FrequencyTable[chartFrequency];

        switch (frequency) {
            case FrequencyEnum.Daily:
                from = moment(dueDate).startOf('day').toDate();
                break;
            case FrequencyEnum.Weekly:
                from = moment(dueDate).startOf('week').toDate();
                break;
            case FrequencyEnum.Monthly:
                from = moment(dueDate).startOf('month').toDate();
                break;
            case FrequencyEnum.Quarterly:
                from = moment(dueDate).startOf('quarter').toDate();
                break;
            case FrequencyEnum.Yearly:
                from = moment(dueDate).startOf('year').toDate();
                break;
        }

        if (!from) {
            return chartDateRange.map(dateRange => {
                return dateRange.custom && dateRange.custom.from ?
                {
                  from: moment(dateRange.custom.from).startOf('day').toDate(),
                  to: moment(dateRange.custom.to).startOf('day').toDate()
                }
                : parsePredefinedDate(dateRange.predefined);
            });
        }
        return [{
            from: from,
            to: to
        }];
    }

    // private _formatNotificationValue(chartDefinition: any, amount: number): string {
    //     if (!chartDefinition || !chartDefinition.tooltip || !chartDefinition.tooltip.custom) {
    //         return amount.toString();
    //     }

    //     const custom = chartDefinition.tooltip.custom;
    //     const decimal = custom.decimals;
    //     if (isNumber(decimal)) {
    //         if (decimal === 0) {
    //             amount = Math.round(amount);
    //         }
    //         amount = amount.toFixed(decimal) as any;
    //     }
    //     return `${custom.prefix}${amount}${custom.suffix}`;
    // }
}