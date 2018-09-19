import { FrequencyEnum, FrequencyTable } from './frequency-enum';
import * as moment from 'moment-timezone';
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
    last6Years: 'last 6 years',
    last7Years: 'last 7 years',
    last8Years: 'last 8 years',
    last9Years: 'last 9 years',
    last10Years: 'last 10 years',
    last11Years: 'last 11 years',
    last12Years: 'last 12 years',
    last13Years: 'last 13 years',
    last14Years: 'last 14 years',
    last15Years: 'last 15 years',
    last16Years: 'last 16 years',
    last17Years: 'last 17 years',
    last18Years: 'last 18 years',
    last19Years: 'last 19 years',
    last20Years: 'last 20 years',
    last21Years: 'last 21 years',
    last22Years: 'last 22 years',
    last23Years: 'last 23 years',
    last24Years: 'last 24 years',
    last25Years: 'last 25 years',
    last26Years: 'last 26 years',
    last27Years: 'last 27 years',
    last28Years: 'last 28 years',
    last29Years: 'last 29 years',
    last30Years: 'last 30 years',
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
                         : moment().subtract(1, 'year').year();

            return {
                from: moment().year(year).quarter(lastQuarter).startOf('quarter').toDate(),
                to: moment().year(year).quarter(lastQuarter).endOf('quarter').toDate()
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
        case PredefinedDateRanges.last6Years:
            return {
                from: moment().subtract(6, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last7Years:
            return {
                from: moment().subtract(7, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };

        case PredefinedDateRanges.last8Years:
            return {
                from: moment().subtract(8, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last9Years:
            return {
                from: moment().subtract(9, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last10Years:
            return {
                from: moment().subtract(10, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last11Years:
            return {
                from: moment().subtract(11, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last12Years:
            return {
                from: moment().subtract(12, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last13Years:
            return {
                from: moment().subtract(13, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last14Years:
            return {
                from: moment().subtract(14, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last15Years:
            return {
                from: moment().subtract(15, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last16Years:
            return {
                from: moment().subtract(16, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last17Years:
            return {
                from: moment().subtract(17, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last18Years:
            return {
                from: moment().subtract(18, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last19Years:
            return {
                from: moment().subtract(19, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last20Years:
            return {
                from: moment().subtract(20, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last21Years:
            return {
                from: moment().subtract(21, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last22Years:
            return {
                from: moment().subtract(22, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last23Years:
            return {
                from: moment().subtract(23, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last24Years:
            return {
                from: moment().subtract(24, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last25Years:
            return {
                from: moment().subtract(25, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last26Years:
            return {
                from: moment().subtract(26, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last27Years:
            return {
                from: moment().subtract(27, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last28Years:
            return {
                from: moment().subtract(28, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last29Years:
            return {
                from: moment().subtract(29, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last30Years:
            return {
                from: moment().subtract(30, 'year').startOf('year').toDate(),
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
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    yesterday: {
        previousPeriod: 'previous period',
        lastWeek: 'last week',
        lastMonth: 'last month',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    thisWeek: {
        previousPeriod: 'previous period',
        lastMonth: 'last month',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    thisWeekToDate: {
        previousPeriod: 'previous period',
        lastMonth: 'last month',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    lastWeek: {
        previousPeriod: 'previous period',
        lastMonth: 'last month',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    thisMonth: {
        previousPeriod: 'previous period',
        lastMonth: 'last month',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    thisMonthToDate: {
        previousPeriod: 'previous period',
        lastMonth: 'last month',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    lastMonth: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    thisQuarter: {
        previousPeriod: 'previous period',
        lastQuarter: 'last quarter',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'

    },
    lastQuarter: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    last3Months: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    last6Months: {
         previousPeriod: 'previous period',
         lastYear: 'last year',
         twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    thisYear: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'

    },
    thisYearToDate: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    lastYear: {
         previousPeriod: 'previous period',
         twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
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
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    last14Days: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    last30Days: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    last90Days: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    last365Days: {
        previousPeriod: 'previous period',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
    },
    custom: {
        previousPeriod: 'previous period',
        lastYear: 'last year',
        twoYearsAgo: '2 years ago',
        threeYearsAgo: '3 years ago',
        fourYearsAgo: '4 years ago',
        fiveYearsAgo: '5 years ago',
        sixYearsAgo: '6 years ago',
        sevenYearsAgo: '7 years ago',
        eightYearsAgo: '8 years ago',
        nineYearsAgo: '9 years ago',
        tenYearsAgo: '10 years ago',
        elevenYearsAgo: '11 years ago',
        twelveYearsAgo: '12 years ago',
        thirteenYearsAgo: '13 years ago',
        fourteenYearsAgo: '14 years ago',
        fifteenYearsAgo: '15 years ago',
        sixteenYearsAgo: '16 years ago',
        seventeenYearsAgo: '17 years ago',
        eighteenYearsAgo: '18 years ago',
        nineteenYearsAgo: '19 years ago',
        twentyYearsAgo: '20 years ago',
        twentyoneYearsAgo: '21 years ago',
        twentytwoYearsAgo: '22 years ago',
        twentythreeYearsAgo: '23 years ago',
        twentyfourYearsAgo: '24 years ago',
        twentyfiveYearsAgo: '25 years ago',
        twentysixYearsAgo: '26 years ago',
        twentysevenYearsAgo: '27 years ago',
        twentyeightYearsAgo: '28 years ago',
        twentynineYearsAgo: '29 years ago',
        thirtyYearsAgo: '30 years ago'
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
    },
    custom: {
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
        case PredefinedDateRanges.last2Years:
            return parsePredifinedDate(PredefinedDateRanges.last2Years);

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
                from: moment(dueDate, momentFormat).subtract(1, 'year').startOf('quarter').toDate(),
                to: moment(dueDate, momentFormat).subtract(1, 'year').endOf('quarter').toDate()
            };
        case PredefinedTargetDateRanges.sameQuarter2YearsAgo:
            return {
                from: moment(dueDate, momentFormat).subtract(2, 'year').startOf('quarter').toDate(),
                to: moment(dueDate, momentFormat).subtract(2, 'year').endOf('quarter').toDate()
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
                case FrequencyEnum.Quarterly:
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
                case FrequencyEnum.Quarterly:
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


export function backInTime(dateRange: IDateRange, amount: any, timespan: string, mainDateRangeFrom?: Date): IDateRange {
    const format: string = 'MM/DD/YYYY';
    const fromDate: Date = moment(dateRange.from).subtract(amount, timespan).toDate();
    let toDate: Date = moment(dateRange.to).subtract(amount, timespan).endOf('day').toDate();

    if (mainDateRangeFrom) {
        const dateRangeFrom: string = moment(mainDateRangeFrom, format).format(format);
        const comparisonToDate: string = moment(dateRange.to).subtract(amount, timespan).format(format);

        const isSameDate: boolean = dateRangeFrom === comparisonToDate;
        if (isSameDate) {
            toDate = moment(dateRange.to).subtract(amount, timespan).startOf('day').toDate();
        }
    }

    return {
        from: fromDate,
        to: toDate
    };
}

export function previousPeriod(dateRange: IDateRange): IDateRange {
    const start = moment(dateRange.from);
    const end = moment(dateRange.to);
    const duration = end.diff(start);

    const isSameDate = end.diff(start, 'days') === 0;
    if (isSameDate) {
        return {
            from: start.subtract(1, 'day').startOf('day').toDate(),
            to: end.startOf('day').toDate()
        };
    }

    return {
        from: start.subtract(duration).startOf('day').toDate(),
        to: end.subtract(duration).startOf('day').toDate()
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


export function parseComparisonDateRange(dateRange: IDateRange, comparisonString: string, mainDateRangeFrom?: Date): IDateRange {

    switch (comparisonString) {

        // today cases
        case 'yesterday':
            return backInTime(dateRange, 1, 'day', mainDateRangeFrom);

        case 'lastWeek':
            return backInTime(dateRange, 1, 'week', mainDateRangeFrom);

        case 'lastMonth':
            return backInTime(dateRange, 1, 'month', mainDateRangeFrom);
        case 'lastYear':
        case 'last year':
            return backInTime(dateRange, 1, 'year', mainDateRangeFrom);
        case 'twoYearsAgo':
        case '2 years ago':
        case 'two years ago':
            return backInTime(dateRange, 2, 'year', mainDateRangeFrom);
        case 'threeYearsAgo':
        case '3 years ago':
        case 'three years ago':
            return backInTime(dateRange, 3, 'year', mainDateRangeFrom);
        case 'fourYearsAgo':
        case '4 years ago':
        case 'four years ago':
            return backInTime(dateRange, 4, 'year', mainDateRangeFrom);
        case 'fiveYearsAgo':
        case '5 years ago':
        case 'five years ago':
            return backInTime(dateRange, 5, 'year', mainDateRangeFrom);
        case 'sixYearsAgo':
        case '6 years ago':
        case 'six years ago':
            return backInTime(dateRange, 6, 'year', mainDateRangeFrom);
        case 'sevenYearsAgo':
        case '7 years ago':
        case 'seven years ago':
            return backInTime(dateRange, 7, 'year', mainDateRangeFrom);
        case 'eightYearsAgo':
        case '8 years ago':
        case 'eight years ago':
            return backInTime(dateRange, 8, 'year', mainDateRangeFrom);
        case 'nineYearsAgo':
        case '9 years ago':
        case 'nine years ago':
            return backInTime(dateRange, 9, 'year', mainDateRangeFrom);
        case 'tenYearsAgo':
        case '10 years ago':
        case 'ten years ago':
            return backInTime(dateRange, 10, 'year', mainDateRangeFrom);
        case 'elevenYearsAgo':
        case '11 years ago':
        case 'eleven years ago':
            return backInTime(dateRange, 11, 'year', mainDateRangeFrom);
        case 'twelveYearsAgo':
        case '12 years ago':
        case 'twelve years ago':
            return backInTime(dateRange, 12, 'year', mainDateRangeFrom);
        case 'thirteenYearsAgo':
        case '13 years ago':
        case 'thirteen years ago':
            return backInTime(dateRange, 13, 'year', mainDateRangeFrom);
        case 'fourteenYearsAgo':
        case '14 years ago':
        case 'fourteen years ago':
            return backInTime(dateRange, 14, 'year', mainDateRangeFrom);
        case 'fifteenYearsAgo':
        case '15 years ago':
        case 'fifteen years ago':
            return backInTime(dateRange, 15, 'year', mainDateRangeFrom);
        case 'sixteenYearsAgo':
        case '16 years ago':
        case 'sixteen years ago':
            return backInTime(dateRange, 16, 'year', mainDateRangeFrom);
        case 'seventeenYearsAgo':
        case '17 years ago':
        case 'seventeen years ago':
            return backInTime(dateRange, 17, 'year', mainDateRangeFrom);
        case 'eighteenYearsAgo':
        case '18 years ago':
        case 'eighteen years ago':
            return backInTime(dateRange, 18, 'year', mainDateRangeFrom);
        case 'nineteenYearsAgo':
        case '19 years ago':
        case 'nineteen years ago':
            return backInTime(dateRange, 19, 'year', mainDateRangeFrom);
        case 'twentyYearsAgo':
        case '20 years ago':
        case 'twenty years Ago':
                return backInTime(dateRange, 20, 'year', mainDateRangeFrom);
        case 'twentyoneYearsAgo':
        case '21 years ago':
        case 'twentyone years ago':
                return backInTime(dateRange, 21, 'year', mainDateRangeFrom);
        case 'twentytwoYearsAgo':
        case '22 years ago':
        case 'twentytwo years ago':
                return backInTime(dateRange, 22, 'year', mainDateRangeFrom);
        case 'twentythreeYearsAgo':
        case '23 years ago':
        case 'twentythree years Ago':
                return backInTime(dateRange, 23, 'year', mainDateRangeFrom);
        case 'twentyfourYearsAgo':
        case '24 years ago':
        case 'twentyfour years ago':
                return backInTime(dateRange, 24, 'year', mainDateRangeFrom);
        case 'twentyfiveYearsAgo':
        case '25 years ago':
        case 'twentyfive years ago':
                return backInTime(dateRange, 25, 'year', mainDateRangeFrom);
        case 'twentysixYearsAgo':
        case '26 years ago':
        case 'twentysix years ago':
                return backInTime(dateRange, 26, 'year', mainDateRangeFrom);
        case 'twentysevenYearsAgo':
        case '27 years ago':
        case 'twentyseven years ago':
                return backInTime(dateRange, 27, 'year', mainDateRangeFrom);
        case 'twentyeightYearsAgo':
        case '28 years ago':
        case 'twentyeight years ago':
                return backInTime(dateRange, 28, 'year', mainDateRangeFrom);
        case 'twentynineYearsAgo':
        case '29 years ago':
        case 'twentynine years ago':
                return backInTime(dateRange, 29, 'year', mainDateRangeFrom);
        case 'thirtyYearsAgo':
        case '30 years ago':
        case 'thirty years ago':
                return backInTime(dateRange, 30, 'year', mainDateRangeFrom);
        case 'lastQuarter':
            // TODO: we have to calculate the previous Q, just back in time 90 days for now
            return backInTime(dateRange, 90, 'days', mainDateRangeFrom);

        case 'previousPeriod':
            return previousPeriod(dateRange);

    }

    return null;
}

export function getComparisonDateRanges(dateRange: IChartDateRange[], comparisonOptions: string[], mainDateRangeFrom: Date): IDateRange[] {
    if (!dateRange || !comparisonOptions) return [];

    return comparisonOptions.map(c => {
         if (isEmpty(c)) return;
         return parseComparisonDateRange(processChartDateRange(dateRange[0]), c, mainDateRangeFrom);
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

export const isValidTimezone = (tz: string): boolean => !!moment.tz.zone(tz);