import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';
import * as moment from 'moment';
import { clone } from 'lodash';

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
IChartDateRange,
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

    async getTargets(chartId: string, userId: string): Promise<ITargetDocument[]> {
        try {
            const visibleTargets: ITargetDocument[] = await this._targets.model.findUserVisibleTargets(chartId, userId);
            return await this.frequentlyUpdateTargets(visibleTargets);
        } catch (err) {
            return ({
                success: false,
                errors: [ { field: 'target', errors: [err] }]
            }) as any;
        }
    }

    async frequentlyUpdateTargets(targets: ITargetDocument[]): Promise<ITargetDocument[]> {
        try {
            if (!targets || !targets.length) {
                return targets;
            }

            const updatedListTargets: ITargetDocument[] = await Bluebird.map(
                                        targets,
                                        (target: ITargetDocument) => this.updateTarget(target)
                                    );
            return updatedListTargets;
        } catch (err) {
            throw new Error('unable to update all targets');
        }
    }


    async updateTarget(target: ITargetDocument): Promise<ITargetDocument> {
        try {
            const id: string = target.id;
            const inputData: ITarget = Object.assign({}, target.toObject() as ITarget);

            const targetAmount: number = await this.caculateFormat(inputData);
            inputData.target = targetAmount;
            inputData.timestamp = new Date();

            const updatedTarget: ITargetDocument = await this._targets.model.updateTarget(id, inputData);

            const targetProgress: number = await this.targetProgressValue(updatedTarget);
            updatedTarget.percentageCompletion = (targetProgress / updatedTarget.target) * 100;

            return updatedTarget;
        } catch (err) {
            throw new Error('unable to update target');
        }
    }

    async targetProgressValue(data: ITargetDocument): Promise<number> {
        try {
            const chart: IChartDocument = await this._charts.model.findById(data.chart[0])
                                                .populate({ path: 'kpis' });
            const kpi: IKpiBase = await this._kpiFactory.getInstance(chart.kpis[0]);

            const groupings: string[] = (chart.groupings && chart.groupings[0]) ? chart.groupings : [];
            const stackName: string = data.stackName ? data.stackName : data.nonStackName;
            const isStackNameEqualToAll: boolean = stackName.toLowerCase() === 'all';

            const dateRange: IDateRange[] = this._getTargetProgressDateRange(chart.frequency, data.datepicker, chart.dateRange);
            const options: IGetDataOptions = {
                filter: chart.filter
            };

            if (!groupings || !groupings.length || !groupings) {
                Object.assign(options, {
                    filter: chart.filter
                });
            } else {
                if (!isStackNameEqualToAll) {
                    Object.assign(options, {
                        groupings: groupings,
                        stackName: stackName
                    });
                }
            }

            const response = await kpi.getData(dateRange, options);
            const totalProgress = response ? response.find(r => r.value) : { value : data.amount };
            const amount: number = totalProgress ? totalProgress.value : 0;

            return amount;
        } catch (err) {
            throw new Error('error getting target progress');
        }
    }

    async getBaseValue(data: ITargetCalculateData): Promise<any> {
        const chart = await this._charts.model.findById(data.chart[0])
            .populate({ path: 'kpis' });
        const kpi: IKpiBase = await this._kpiFactory.getInstance(chart.kpis[0]);
        const groupings: string[] = chart.groupings || [];
        const targetDateRange: IDateRange[] = this.getDate(data.period, data.datepicker, chart.frequency, chart.dateRange);
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
        } else if (Array.isArray(groupings) && !groupings[0]) {
            getDataOptions = { filter: chart.filter };
        } else {
            getDataOptions = { filter: chart.filter };

            if (data.nonStackName.toLocaleLowerCase() !== 'all') {
                getDataOptions.stackName = this.getComparisonStackName(chart, data).name;
                getDataOptions.groupings = groupings;
            }
        }

        return await kpi.getData(targetDateRange, getDataOptions);
    }

    async caculateFormat(data: ITargetCalculateData): Promise<number> {
        try {
            const response = await this.getBaseValue(data);
            const dataAmount: number = parseFloat(data.amount.toString());
            const findValue = response ? response.find(r => r.value) : { value: data.amount };

            const responseValue: number = findValue ? findValue.value : 0;

            switch (data.vary) {

                case 'fixed':
                    return dataAmount;

                case 'increase':
                    switch (data.amountBy) {
                        case 'percent':
                            const increasePercentResult: number = responseValue + (responseValue * (dataAmount / 100) );
                            return increasePercentResult;

                        case 'dollar':
                            const increaseDollarResult: number = responseValue + dataAmount;
                            return increaseDollarResult;

                    }
                case 'decrease':
                    switch (data.amountBy) {
                        case 'percent':
                            const decreasePercentResult: number = responseValue - (responseValue * (dataAmount / 100) );
                            return decreasePercentResult;

                        case 'dollar':
                            const descreaseDollarResult: number = responseValue - dataAmount;
                            return descreaseDollarResult;

                    }
            }
        } catch (err) {
            throw new Error('unable to calcuate target amount');
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
    getDate(period: string, dueDate: string, chartFrequency: string, chartDateRange: IChartDateRange[]): IDateRange[] {
        return [parsePredefinedTargetDateRanges(period, dueDate, chartFrequency)] ||
               chartDateRange.map(dateRange => {
                   return dateRange.custom && dateRange.custom.from ?
                   {
                        from: moment(dateRange.custom.from).startOf('day').toDate(),
                        to: moment(dateRange.custom.to).startOf('day').toDate()
                   }
                   : parsePredifinedDate(dateRange.predefined);
               });
    }

    isComparison(chart: IChartDocument): boolean {
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
            default:
                // no frequency
                return null;
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

    private _getTargetProgressDateRange(chartFrequency: string, dueDate: string, chartDateRange: IChartDateRange[]): IDateRange[] {
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
                : parsePredifinedDate(dateRange.predefined);
            });
        }
        return [{
            from: from,
            to: to
        }];
    }
}