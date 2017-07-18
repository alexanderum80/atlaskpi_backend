export interface IDateRange {
    from: Date;
    to: Date;
}

export const DateRange = {
    from: Date,
    to: Date,
};

export const PredefinedDateRanges = {
    lastWeek: 'last week',
    lastMonth: 'last month',
    lastQuarter: 'last quarter',
    last3Months: 'last 3 months',
    last6Months: 'last 6 months',
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

    switch (textDate) {
        case PredefinedDateRanges.lastWeek:
            return;
        case PredefinedDateRanges.lastMonth:
            return;
        case PredefinedDateRanges.lastQuarter:
            return;
        case PredefinedDateRanges.last3Months:
            return;
        case PredefinedDateRanges.last6Months:
            return;
        case PredefinedDateRanges.lastYear:
            return;
        case PredefinedDateRanges.last2Years:
            return;
        case PredefinedDateRanges.last3Years:
            return;
        case PredefinedDateRanges.last4Years:
            return;
        case PredefinedDateRanges.last5Years:
            return;
        case PredefinedDateRanges.thisWeek:
            return;
        case PredefinedDateRanges.thisMonth:
            return;
        case PredefinedDateRanges.thisQuarter:
            return;
        case PredefinedDateRanges.thisYear:
            return;
    }

}