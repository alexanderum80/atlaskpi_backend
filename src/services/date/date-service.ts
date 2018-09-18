import { injectable } from 'inversify';
import * as m from 'moment-timezone';

import { IChartDateRange, IDateRange, parsePredefinedDate } from '../../domain/common/date-range';
import { FrequencyEnum } from '../../domain/common/frequency-enum';

@injectable()
export class DateService {

    getDateRange(dateRange: IChartDateRange): IDateRange | null {
        if (dateRange.predefined !== 'custom') {
            return parsePredefinedDate(dateRange.predefined);
        }

        return {
            from: m(dateRange.custom.from).startOf('day').toDate(),
            to: m(dateRange.custom.to).endOf('day').toDate(),
        };
    }

    getFrequencyDateRange(chartDateRange: IChartDateRange, frequency: string, date: m.Moment): IDateRange {
        let uoft: m.unitOfTime.StartOf;
        const dr = this.getDateRange(chartDateRange);

        switch (frequency) {
            case 'daily':
                uoft = 'day';
                break;
            case 'monthly':
                uoft = 'month';
                break;
            case 'quarterly':
                uoft = 'quarter';
                break;
            case 'weekly':
                uoft = 'week';
                break;
            case 'yearly':
                uoft = 'year';
                break;
        }

        // return {
        //     from: m.tz(timezone).startOf(uoft).toDate(),
        //     to: m.tz(timezone).endOf(uoft).toDate(),
        // };
        return {
            from: date.clone().startOf(uoft).toDate(),
            to: dr.to,
        };
    }

    getFrequency(text: string): FrequencyEnum {
        switch (text) {
            case 'daily':
                return FrequencyEnum.Daily;
            case 'monthly':
                return FrequencyEnum.Monthly;
            case 'quarterly':
                return FrequencyEnum.Quarterly;
            case 'weekly':
                return FrequencyEnum.Weekly;
            case 'yearly':
                return FrequencyEnum.Yearly;
        }
    }

    convertFrequencyToDuration(frequency: string): m.unitOfTime.DurationConstructor {
        switch (frequency) {
            case 'daily':
                return 'day';
            case 'monthly':
                return 'month';
            case 'quarterly':
                return 'quarter';
            case 'weekly':
                return 'week';
            case 'yearly':
                return 'year';
        }
    }

}