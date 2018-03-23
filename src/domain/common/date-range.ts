import { FrequencyEnum, FrequencyTable } from './frequency-enum';
import * as moment from 'moment';
import { isEmpty } from 'lodash';

/**
 * TODO:
 * - fix all daterange functions to work work with utc time (depends on a timezone cofiguraiton).
 * - make an understanding about where or not to show "previous period" when dateranges represents whole months, weeks, quarter
 */

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

export interface IPredefinedTargetPeriod {
    samePeriodLastYear?: string;
    samePeriod2YearsAgo?: string;
    sameDayLastYear?: string;
    sameDay2YearsAgo?: string;
    sameWeekLastYear?: string;
    sameWeek2YearsAgo?: string;
    sameMonthLastYear?: string;
    sameMonth2YearsAgo?: string;
    sameQuarterLastYear?: string;
    sameQuarter2YearsAgo?: string;
    lastYear?: string;
    twoYearsAgo?: string;
}


export const PredefinedDateRanges = {
    custom: 'custom',
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
    lastYearToDate: 'last year to date',
    last2YearsToDate: 'last 2 years to date',
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

const thisQuarter = moment().quarter();

export function parsePredifinedDate(textDate: string): IDateRange {
    let from: Date;
    let to: Date;

    switch (textDate) {
        case PredefinedDateRanges.allTimes:
            return {
                from: (<any>moment).min(moment().subtract(30, 'years'), moment().subtract(1, 'years')).startOf('year').toDate(),
                to: moment().toDate()
            };
        case PredefinedDateRanges.lastWeek:
            return {
                from: moment().subtract(1, 'week').startOf('week').toDate(),
                to: moment().subtract(1, 'week').endOf('week').toDate()
            };
        case PredefinedDateRanges.lastMonth:
            return {
                from: moment().subtract(1, 'month').startOf('month').toDate(),
                to: moment().subtract(1, 'month').endOf('month').toDate()
            };
        case PredefinedDateRanges.last3Months:
            return {
                from: moment().subtract(3, 'month').startOf('month').toDate(),
                to: moment().subtract(1, 'month').endOf('month').toDate()
            };
        case PredefinedDateRanges.last6Months:
            return {
                from: moment().subtract(6, 'month').startOf('month').toDate(),
                to: moment().subtract(1, 'month').endOf('month').toDate()
            };
        case PredefinedDateRanges.lastQuarter:
            const lastQuarter = thisQuarter - 1 || 4;
            const year = (thisQuarter - 1)
                         ? moment().year()
                         : moment().subtract(1, 'year');

            return {
                from: moment(year).quarter(lastQuarter).startOf('quarter').toDate(),
                to: moment(year).quarter(lastQuarter).endOf('quarter').toDate()
            };
        case PredefinedDateRanges.lastYear:
            return {
                from: moment().subtract(1, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last2Years:
            return {
                from: moment().subtract(2, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last3Years:
            return {
                from: moment().subtract(3, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last4Years:
            return {
                from: moment().subtract(4, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last5Years:
            return {
                from: moment().subtract(5, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.lastYearToDate:
            return {
                from: moment().subtract(1, 'year').startOf('year').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.last2YearsToDate:
            return {
                from: moment().subtract(2, 'year').startOf('year').toDate(),
                to: moment().endOf('day').toDate()
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
            return {
                from: moment().quarter(thisQuarter).startOf('quarter').toDate(),
                to: moment().quarter(thisQuarter).endOf('quarter').toDate()
            };
        case PredefinedDateRanges.thisYear:
            return {
                from: moment().startOf('year').toDate(),
                to: moment().endOf('year').toDate()
            };
        case PredefinedDateRanges.yesterday:
            return {
                from: moment().subtract(1, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
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
                from: moment().startOf('month').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.thisQuarterToDate:
        return {
            from: moment().quarter(thisQuarter).startOf('quarter').toDate(),
            to: moment().endOf('day').toDate()
        };
        case PredefinedDateRanges.thisYearToDate:
            return {
                from: moment().startOf('year').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.last7Days:
            return {
                from: moment().subtract(7, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
            };
        case PredefinedDateRanges.last14Days:
            return {
                from: moment().subtract(14, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
            };
        case PredefinedDateRanges.last30Days:
            return {
                from: moment().subtract(30, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
            };
        case PredefinedDateRanges.last90Days:
            return {
                from: moment().subtract(90, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
            };
        case PredefinedDateRanges.last365Days:
            return {
                from: moment().subtract(365, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
            };
        case PredefinedDateRanges.custom:
            return {
                from: undefined,
                to: undefined
            };
    }

}


export const PredefinedComparisonDateRanges = {
    today: {
        previousPeriod: 'previous period',
        lastWeek: 'last week',
        lastMonth: 'last month',
        lastYear: 'last year',
    },
    yesterday: {
        previousPeriod: 'previous period',
        lastWeek: 'last week',
        lastMonth: 'last month',
        lastYear: 'last year',
    },
    thisWeek: {
        previousPeriod: 'previous period',
        lastMonth: 'last month',
        lastYear: 'last year',
    },
    thisWeekToDate: {
        previousPeriod: 'previous period',
        lastMonth: 'last month',
        lastYear: 'last year',
    },
    lastWeek: {
        previousPeriod: 'previous period',
        lastMonth: 'last month',
        lastYear: 'last year',
    },
    thisMonth: {
        previousPeriod: 'previous period',
        lastMonth: 'last month',
        lastYear: 'last year',
    },
    thisMonthToDate: {
        previousPeriod: 'previous period',
        lastMonth: 'last month',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago'
    },
    lastMonth: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
    },
    thisQuarter: {
        previousPeriod: 'previous period',
        lastQuarter: 'last quarter',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
    },
    lastQuarter: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
    },
    last3Months: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago'
    },
    last6Months: {
         previousPeriod: 'previous period',
         lastYear: 'last year',
         twoYearsAgo: '2 years ago',
    },
    thisYear: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
    },
    thisYearToDate: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
    },
    lastYear: {
         previousPeriod: 'previous period',
         twoYearsAgo: '2 years ago',
         threeYearsAgo: '3 years ago',
    },
    lastYearToDate: {
        previousPeriod: 'previous period'
    },
    last2YearsToDate: {
        previousPeriod: 'previous period'
    },
    last2Years: {
        previousPeriod: 'previous period'
    },
    last3Years: {
        previousPeriod: 'previous period'
    },
    last4Years: {
        previousPeriod: 'previous period'
    },
    last5Years: {
        previousPeriod: 'previous period'
    },
    last7Days: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago'
    },
    last14Days: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago'
    },
    last30Days: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago'
    },
    last90Days: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago'
    },
    last365Days: {
        previousPeriod: 'previous period',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago'
    },
    custom: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago'
    }
};

export const PredefinedTargetPeriod = {
    daily: {
        sameDayLastYear: 'same day, last year',
        sameDay2YearsAgo: 'same day, 2 years ago'
    },
    weekly: {
        sameWeekLastYear: 'same week, last year',
        sameWeek2YearsAgo: 'same week, 2 years ago',
        samePeriodLastYear: 'same period, last year',
        samePeriod2YearsAgo: 'same period, 2 years ago'
    },
    monthly: {
        sameMonthLastYear: 'same month, last year',
        sameMonth2YearsAgo: 'same month, 2 years ago',
        samePeriodLastYear: 'same period, last year',
        samePeriod2YearsAgo: 'same period, 2 years ago'
    },
    quarterly: {
        sameQuarterLastYear: 'same quarter, last year',
        sameQuarter2YearsAgo: 'same quarter, 2 years ago',
        samePeriodLastYear: 'same period, last year',
        samePeriod2YearsAgo: 'same period, 2 years ago'
    },
    yearly: {
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        samePeriodLastYear: 'same period, last year',
        samePeriod2YearsAgo: 'same period, 2 years ago'
    }
};

/**
 *
 * @param predefinedDate last year
 * @param dueDate MM/DD/YYYY
 */
export function parsePredefinedTargetDateRanges (predefinedDate: string, dueDate: string, chartFrequency: string): IDateRange {
    const momentFormat: string = 'MM/DD/YYYY';
    const frequency: number = FrequencyTable[chartFrequency];

    let PredefinedTargetDateRanges: IPredefinedTargetPeriod = {};

    Object.keys(PredefinedTargetPeriod).forEach((key: string) => {
        Object.assign(PredefinedTargetDateRanges, PredefinedTargetPeriod[key]);
    });

    switch (predefinedDate) {
        case PredefinedDateRanges.lastMonth:
            return parsePredifinedDate(PredefinedDateRanges.lastMonth);
        case PredefinedDateRanges.yesterday:
            return parsePredifinedDate(PredefinedDateRanges.yesterday);
        case PredefinedDateRanges.lastWeek:
            return parsePredifinedDate(PredefinedDateRanges.lastWeek);
        case PredefinedDateRanges.lastQuarter:
            return parsePredifinedDate(PredefinedDateRanges.lastQuarter);
        case PredefinedDateRanges.lastYear:
            return parsePredifinedDate(PredefinedDateRanges.lastYear);


        // frequency = 'daily'
        case PredefinedTargetDateRanges.sameDayLastYear:
            return {
                from: moment(dueDate, momentFormat).subtract(1, 'year').startOf('day').toDate(),
                to: moment(dueDate, momentFormat).subtract(1, 'year').endOf('day').toDate()
            };
        case PredefinedTargetDateRanges.sameDay2YearsAgo:
            return {
                from: moment(dueDate, momentFormat).subtract(2, 'year').startOf('day').toDate(),
                to: moment(dueDate, momentFormat).subtract(2, 'year').endOf('day').toDate()
            };

        // frequency = 'weekly'
        case PredefinedTargetDateRanges.sameWeekLastYear:
            return {
                from: moment(dueDate, momentFormat).subtract(1, 'year').startOf('week').toDate(),
                to: moment(dueDate, momentFormat).subtract(1, 'year').endOf('week').toDate()
            };
        case PredefinedTargetDateRanges.sameWeek2YearsAgo:
            return {
                from: moment(dueDate, momentFormat).subtract(2, 'year').startOf('week').toDate(),
                to: moment(dueDate, momentFormat).subtract(2, 'year').endOf('week').toDate()
            };

        // frequency = 'monthly'
        case PredefinedTargetDateRanges.sameMonthLastYear:
            return {
                from: moment(dueDate, momentFormat).subtract(1, 'year').startOf('month').toDate(),
                to: moment(dueDate, momentFormat).subtract(1, 'year').endOf('month').toDate()
            };
        case PredefinedTargetDateRanges.sameMonth2YearsAgo:
            return {
                from: moment(dueDate, momentFormat).subtract(2, 'year').startOf('month').toDate(),
                to: moment(dueDate, momentFormat).subtract(2, 'year').endOf('month').toDate()
            };

        // frequency = 'quarterly'
        case PredefinedTargetDateRanges.sameQuarterLastYear:
            return {
                from: moment(dueDate, momentFormat).subtract(1, 'year').quarter(thisQuarter).startOf('quarter').toDate(),
                to: moment(dueDate, momentFormat).subtract(1, 'year').quarter(thisQuarter).endOf('quarter').toDate()
            };
        case PredefinedTargetDateRanges.sameQuarter2YearsAgo:
            return {
                from: moment(dueDate, momentFormat).subtract(2, 'year').quarter(thisQuarter).startOf('quarter').toDate(),
                to: moment(dueDate, momentFormat).subtract(2, 'year').quarter(thisQuarter).endOf('quarter').toDate()
            };
        // yearly
        case PredefinedTargetDateRanges.twoYearsAgo:
            return {
                from: moment().subtract(2, 'year').startOf('year').toDate(),
                to: moment().subtract(2, 'year').endOf('year').toDate()
            };

        // any frequency
        case PredefinedTargetDateRanges.samePeriodLastYear:
            switch (frequency) {
                case FrequencyEnum.Weekly:
                    return {
                        from: moment(dueDate, momentFormat).subtract(1, 'year').startOf('week').toDate(),
                        to: moment(dueDate, momentFormat).subtract(1, 'year').endOf('day').toDate()
                    };
                case FrequencyEnum.Monthly:
                    return {
                        from: moment(dueDate, momentFormat).subtract(1, 'year').startOf('month').toDate(),
                        to: moment(dueDate, momentFormat).subtract(1, 'year').endOf('day').toDate()
                    };
                case FrequencyEnum.Quartely:
                    return {
                        from: moment(dueDate, momentFormat).subtract(1, 'year').startOf('quarter').toDate(),
                        to: moment(dueDate, momentFormat).subtract(1, 'year').endOf('day').toDate()
                    };
                case FrequencyEnum.Yearly:
                    return {
                        from: moment(dueDate, momentFormat).subtract(1, 'year').startOf('year').toDate(),
                        to: moment(dueDate, momentFormat).subtract(1, 'year').endOf('day').toDate()
                    };
            }
        case PredefinedTargetDateRanges.samePeriod2YearsAgo:
            switch (frequency) {
                case FrequencyEnum.Weekly:
                    return {
                        from: moment(dueDate, momentFormat).subtract(2, 'year').startOf('week').toDate(),
                        to: moment(dueDate, momentFormat).subtract(2, 'year').endOf('day').toDate()
                    };
                case FrequencyEnum.Monthly:
                    return {
                        from: moment(dueDate, momentFormat).subtract(2, 'year').startOf('month').toDate(),
                        to: moment(dueDate, momentFormat).subtract(2, 'year').endOf('day').toDate()
                    };
                case FrequencyEnum.Quartely:
                    return {
                        from: moment(dueDate, momentFormat).subtract(2, 'year').startOf('quarter').toDate(),
                        to: moment(dueDate, momentFormat).subtract(2, 'year').endOf('day').toDate()
                    };
                case FrequencyEnum.Yearly:
                    return {
                        from: moment(dueDate, momentFormat).subtract(2, 'year').startOf('year').toDate(),
                        to: moment(dueDate, momentFormat).subtract(2, 'year').endOf('day').toDate()
                    };
            }
    }
}


export function backInTime(dateRange: IDateRange, amount: any, timespan: string): IDateRange {
    return {
        from: moment(dateRange.from).subtract(amount, timespan).toDate(),
        to: moment(dateRange.to).subtract(amount, timespan).toDate()
    };
}

export function previousPeriod(dateRange: IDateRange): IDateRange {
    const start = moment(dateRange.from);
    const end = moment(dateRange.to);
    const duration = end.diff(start);

    return {
        from: start.subtract(duration).startOf('day').toDate(),
        to: end.subtract(duration).endOf('day').toDate()
    };
}

export function getDateRangeIdentifier(text: string): string {
    const dateRangesKeys = Object.keys(PredefinedDateRanges);

    for (let i = 0; i < dateRangesKeys.length; i++) {
        if (dateRangesKeys[i] === text) {
            return dateRangesKeys[i];
        }
    }

    return null;
}

export function getDateRangeIdFromString(text: string): string {
    const dateRangesKeys = Object.keys(PredefinedDateRanges);

    for (let i = 0; i < dateRangesKeys.length; i++) {
        if (PredefinedDateRanges[dateRangesKeys[i]] === text) {
            return dateRangesKeys[i];
        }
    }

    return null;
}


export function parseComparisonDateRange(dateRange: IDateRange, comparisonString: string): IDateRange {

    switch (comparisonString) {

        // today cases
        case 'yesterday':
            return backInTime(dateRange, 1, 'day');

        case 'lastWeek':
            return backInTime(dateRange, 1, 'week');

        case 'lastMonth':
            return backInTime(dateRange, 1, 'month');

        case '3YearsAgo':
            return backInTime(dateRange, 3, 'year');

        case 'lastYear':
            return backInTime(dateRange, 1, 'year');

        case 'twoYearsAgo':
            return backInTime(dateRange, 2, 'year');

        case 'threeYearsAgo':
            return backInTime(dateRange, 3, 'year');

        case 'lastQuarter':
            // TODO: we have to calculate the previous Q, just back in time 90 days for now
            return backInTime(dateRange, 90, 'days');

        case 'previousPeriod':
            return previousPeriod(dateRange);

    }

    return null;
}

export function getComparisonDateRanges(dateRange: IChartDateRange[], comparisonOptions: string[]): IDateRange[] {
    if (!dateRange || !comparisonOptions) return [];

    return comparisonOptions.map(c => {
         if (isEmpty(c)) return;
         return parseComparisonDateRange(processChartDateRange(dateRange[0]), c);
    });
}

export function processChartDateRange(chartDateRange: IChartDateRange): IDateRange {
    return chartDateRange.custom && chartDateRange.custom.from ?
            { from: new Date(chartDateRange.custom.from), to: new Date(chartDateRange.custom.to) }
            : parsePredifinedDate(chartDateRange.predefined);
}

export function getYesterdayDate(): IDateRange {
    return {
        from: moment().utc().startOf('day').subtract(1, 'day').toDate(),
        to: moment().utc().startOf('day').toDate()
    };
}
