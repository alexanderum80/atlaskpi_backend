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
    allTimes: 'all times',
    lastWeek: 'last week',
    last30Days: 'last 30 days',
    lastMonth: 'last month',
    last3Months: 'last 3 months',
    last6Months: 'last 6 months',
    lastQuarter: 'last quarter',
    lastYear: 'last year',
    last2Years: 'last 2 years',
    last3Years: 'last 3 years',
    last4Years: 'last 4 years',
    last5Years: 'last 5 years',
    thisWeek: 'this week',
    thisMonth: 'this month',
    thisQuarter: 'this quarter',
    thisYear: 'this year',
};

export function parsePredifinedDate(textDate: string): IDateRange {
    let from: Date;
    let to: Date;

    switch (textDate) {
        case PredefinedDateRanges.allTimes:
            return {
                from: moment().subtract(10000, 'year').toDate(),
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
                from: moment().startOf('month').subtract(1, 'month').toDate(),
                to: moment().startOf('month').subtract(1, 'day').toDate()
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
            return;
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
            return;
        case PredefinedDateRanges.thisYear:
            return {
                from: moment().startOf('year').toDate(),
                to: moment().endOf('year').subtract(1, 'day').toDate()
            };
    }

}