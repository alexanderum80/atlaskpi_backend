import * as moment from 'moment';

export interface IDateRange {
    from: Date;
    to: Date;
}

export const DateRange = {
    from: Date,
    to: Date,
};

export interface IChartDateRange {
    predefined?: string;
    custom?: IDateRange;
}

export const PredefinedDateRanges = {
    today: 'today',
    yesterday: 'yesterday',
    thisWeek: 'this week',
    thisWeekToDate: 'this week to date',
    thisMonth: 'this month',
    thisMonthToDate: 'this month to date',
    thisQuarter: 'this quarter',
    thisQuarterToDate: 'this quarter to date',
    thisYear: 'this year',
    thisYearToDate: 'this year to date',
    lastWeek: 'last week',
    lastMonth: 'last month',
    last3Months: 'last 3 months',
    last6Months: 'last 6 months',
    lastQuarter: 'last quarter',
    lastYear: 'last year',
    last2Years: 'last 2 years',
    last3Years: 'last 3 years',
    last4Years: 'last 4 years',
    last5Years: 'last 5 years',
    last7Days: 'last 7 days',
    last14Days: 'last 14 days',
    last30Days: 'last 30 days',
    last90Days: 'last 90 days',
    last365Days: 'last 365 days',
    allTimes: 'all times'
};

export const quarterMonths = {
    '1': ['Jan', 'Feb', 'Mar'],
    '2': ['Apr', 'May', 'Jun'],
    '3': ['Jul', 'Aug', 'Sep'],
    '4': ['Oct', 'Nov', 'Dec']
};

const quarterKey = moment().quarter();

export function parsePredifinedDate(textDate: string): IDateRange {
    let from: Date;
    let to: Date;

    switch (textDate) {
        case PredefinedDateRanges.allTimes:
            return {
                from: (<any>moment).min(moment().subtract(10, 'years'), moment().subtract(1, 'years')).startOf('year').toDate(),
                to: moment().toDate()
            };
        case PredefinedDateRanges.lastWeek:
            return {
                from: moment().startOf('week').subtract(1, 'week').toDate(),
                to: moment().startOf('week').subtract(1, 'day').toDate()
            };
        case PredefinedDateRanges.last30Days:
            return {
                from: moment().startOf('month').toDate(),
                to: moment().endOf('month').toDate()
            };
        case PredefinedDateRanges.lastMonth:
            return {
                from: moment().utc().startOf('month').subtract(1, 'month').toDate(),
                to: moment().utc().startOf('month').subtract(1, 'day').toDate()
            };
        case PredefinedDateRanges.last3Months:
            return {
                from: moment().startOf('month').subtract(3, 'month').toDate(),
                to: moment().startOf('month').subtract(1, 'day').toDate()
            };
        case PredefinedDateRanges.last6Months:
            return {
                from: moment().startOf('month').subtract(6, 'month').toDate(),
                to: moment().startOf('month').subtract(1, 'day').toDate()
            };
        case PredefinedDateRanges.lastQuarter:
            let getStartQuarter = quarterKey - 1;
            let lStartQuarter = quarterMonths[getStartQuarter][0];
            let lEndQuarter = quarterMonths[getStartQuarter][2];
            return {
                from: moment().utc().month(lStartQuarter).startOf('month').toDate(),
                to: moment().utc().month(lEndQuarter).endOf('month').toDate()
            }
        case PredefinedDateRanges.lastYear:
            return {
                from: moment().startOf('year').subtract(1, 'year').toDate(),
                to: moment().startOf('year').subtract(1, 'day').toDate()
            };
        case PredefinedDateRanges.last2Years:
            return {
                from: moment().startOf('year').subtract(2, 'year').toDate(),
                to: moment().startOf('year').subtract(1, 'day').toDate()
            };
        case PredefinedDateRanges.last3Years:
            return {
                from: moment().startOf('year').subtract(3, 'year').toDate(),
                to: moment().startOf('year').subtract(1, 'day').toDate()
            };
        case PredefinedDateRanges.last4Years:
            return {
                from: moment().startOf('year').subtract(4, 'year').toDate(),
                to: moment().startOf('year').subtract(1, 'day').toDate()
            };
        case PredefinedDateRanges.last5Years:
            return {
                from: moment().startOf('year').subtract(5, 'year').toDate(),
                to: moment().startOf('year').subtract(1, 'day').toDate()
            };
        case PredefinedDateRanges.thisWeek:
            return {
                from: moment().startOf('week').toDate(),
                to: moment().endOf('week').toDate()
            };
        case PredefinedDateRanges.thisMonth:
            return {
                from: moment().startOf('month').toDate(),
                to: moment().endOf('month').toDate()
            };
        case PredefinedDateRanges.thisQuarter:
            // TODO: Pending
            let sQuater = quarterMonths[quarterKey][0];
            let eQuarter = quarterMonths[quarterKey][2];
            return {
                from: moment().utc().month(sQuater).startOf('month').toDate(),
                to: moment().utc().month(eQuarter).endOf('month').toDate()
            }
        case PredefinedDateRanges.thisYear:
            return {
                from: moment().startOf('year').toDate(),
                to: moment().endOf('year').toDate()
            };
        case PredefinedDateRanges.yesterday:
            return {
                from: moment().subtract(1, 'days').startOf('day').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.thisWeekToDate:
            return {
                from: moment().startOf('isoWeek').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.today:
            return {
                from: moment().startOf('day').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.thisMonthToDate:
            return {
                from: moment().utc().startOf('month').toDate(),
                to: moment().utc().endOf('day').toDate()
            };
        case PredefinedDateRanges.thisQuarterToDate:
            let qStart = quarterMonths[quarterKey][0];
            return {
                from: moment().utc().month(qStart).startOf('month').toDate(),
                to: moment().utc().endOf('day').toDate()
            };
        case PredefinedDateRanges.thisYearToDate:
            return {
                from: moment().startOf('year').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.last7Days:
            return {
                from: moment().subtract(7, 'days').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.last14Days:
            return {
                from: moment().subtract(14, 'days').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.last90Days:
            return {
                from: moment().subtract(90, 'days').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.last365Days:
            return {
                from: moment().subtract(365, 'days').toDate(),
                to: moment().endOf('day').toDate()
            };
    }

}