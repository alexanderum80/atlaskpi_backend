import { find, orderBy } from 'lodash';
import { String } from 'aws-sdk/clients/cloudsearch';
export const FREQUENCY_GROUPING_NAME = 'frequency';

export enum FrequencyEnum {
    Daily,
    Weekly,
    Monthly,
    Quartely,
    Yearly
}

export enum SortingCriteriaEnum {
    Values = 'values',
    Frequency = 'frequency',
    Categories = 'categories',
    Groupings = 'groupingAlphabetically',
    Totals = 'valuesTotal'
 }

 export enum SortingOrderEnum {
    Ascending = 'ascending',
    Descending = 'descending'
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

export function getFrequencySequence(data: any, frequency: FrequencyEnum, groupingField: string , sortingCriteria: string, sortingOrder: string): number[] {
    const frequencies = [];
    let existFrequency = false;
    switch (frequency) {
        case FrequencyEnum.Daily:
            if (sortingCriteria) {
                if (sortingCriteria !== SortingCriteriaEnum.Frequency) {
                    data.forEach(element => {
                        existFrequency = frequencies.find(m => m === element._id.day);
                        if (!existFrequency) frequencies.push(element._id.day);
                    });
                } else if (sortingCriteria === SortingCriteriaEnum.Frequency && sortingOrder) {
                    if (sortingOrder === SortingOrderEnum.Descending) {
                        // return array of values from 31 to 1
                        for (let i = 31; i >= 1; i--) frequencies.push(i);
                    } else if (sortingOrder === SortingOrderEnum.Ascending) {
                        // return array of values from 1 to 31
                        for (let i = 1; i <= 31; i++) frequencies.push(i);
                    }
                }
            } else {
                // return array of values from 1 to 31
                for (let i = 1; i <= 31; i++) frequencies.push(i);
            }
            return frequencies;
        case FrequencyEnum.Monthly:
            if (sortingCriteria) {
                if (sortingCriteria !== SortingCriteriaEnum.Frequency) {
                    data.forEach(element => {
                        existFrequency = frequencies.find(m => m === element._id.month);
                        if (!existFrequency) frequencies.push(element._id.month);
                    });
                } else if (sortingCriteria === SortingCriteriaEnum.Frequency && sortingOrder) {
                    if (sortingOrder === SortingOrderEnum.Descending) {
                        return [12, 11, 10, 9, 8 , 7, 6, 5 , 4 , 3 , 2 , 1];
                    } else if (sortingOrder === SortingOrderEnum.Ascending) {
                        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                    }
                }
                return frequencies;
            } else {
                return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            }
        case FrequencyEnum.Quartely:
            if (sortingCriteria) {
                if (sortingCriteria !== SortingCriteriaEnum.Frequency) {
                    data.forEach(element => {
                        existFrequency = frequencies.find(m => m === element._id.quarter);
                        if (!existFrequency) frequencies.push(element._id.quarter);
                    });
                    return frequencies;
                } else if (sortingCriteria === SortingCriteriaEnum.Frequency && sortingOrder) {
                    if (sortingOrder === SortingOrderEnum.Descending) {
                        return [4, 3, 2, 1];
                    } else if (sortingOrder === SortingOrderEnum.Ascending) {
                        return [1, 2, 3, 4];
                    }
                }
            } else {
                return [1, 2, 3, 4];
            }
        case FrequencyEnum.Yearly:
            if (sortingCriteria && sortingCriteria === SortingCriteriaEnum.Frequency && sortingOrder) {
                data = orderBy(data, '_id.year', sortingOrder === SortingOrderEnum.Ascending ? 'asc' : 'desc');
            }
            data.forEach(element => {
                existFrequency = frequencies.find(m => m === element._id.year);
                if (!existFrequency) frequencies.push(element._id.year);
            });
            return frequencies;
        case FrequencyEnum.Weekly:
            return _getArrayFromRange(data , 1, 53, groupingField , sortingCriteria, sortingOrder);
    }
}

function _getArrayFromRange(data: any, from: number, to: number, groupingField: string , sortingCriteria , sortingOrder: string) {
    let i = from;
    let range: number[] = [];
    if (sortingCriteria) {
        if (sortingCriteria !== SortingCriteriaEnum.Frequency) {
            data.forEach(element => {
                if (!range.find(m => m === element._id.week)) range.push(element._id.week);
            });
        } else if (sortingOrder && sortingOrder === SortingOrderEnum.Descending) {
            let i = to;
            while (i > from) { range.push(i); i--; }
        } else if (sortingOrder && sortingOrder === SortingOrderEnum.Ascending) {
            let i = from;
            while (i < to) { range.push(i); i++; }
        }
    } else {
        while (i < to) {
            range.push(i); i++;
        }
    }
    return range;
}