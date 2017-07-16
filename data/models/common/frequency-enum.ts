import * as moment from 'moment';

export const FREQUENCY_GROUPING_NAME = 'frequency';

export enum FrequencyEnum {
    Daily,
    Weekly,
    Monthly,
    Quartely,
    Yearly
}

export const FrequencyTable = {
    daily: FrequencyEnum.Daily,
    weekly: FrequencyEnum.Weekly,
    monthly: FrequencyEnum.Monthly,
    quartely: FrequencyEnum.Quartely,
    yearly: FrequencyEnum.Yearly,
};

export function getFrequencyPropName(frequency: FrequencyEnum) {
    switch (frequency) {
        case FrequencyEnum.Daily:
            return 'day';
        case FrequencyEnum.Weekly:
            return 'week';
        case FrequencyEnum.Monthly:
            return 'month';
        case FrequencyEnum.Quartely:
            return 'quarter';
        case FrequencyEnum.Yearly:
            return 'year';
    }
}

export function getFrequencySequence(frequency: FrequencyEnum): number[] {
    switch (frequency) {
        case FrequencyEnum.Daily:
            return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
        case FrequencyEnum.Monthly:
            return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        case FrequencyEnum.Quartely:
            return [1, 2, 3, 4];
        // case FrequencyEnum.Yearly:
        //     return 'year';
        // case FrequencyEnum.Weekly:
        //     return 'week';
    }
}