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
    switch (frequency) {
        case FrequencyEnum.Daily:
            if (sortingCriteria && sortingCriteria === 'valuesTotal') {
                data.forEach(element => {
                    if (!frequencies.find(m => m === element._id.day)) frequencies.push(element._id.day);
                });
            } else if (sortingCriteria && (sortingCriteria === 'values' || (groupingField && data.find(element => element._id[groupingField] === sortingCriteria)))) {
                data.forEach(element => {
                    if (!frequencies.find(m => m === element._id.day)) frequencies.push(element._id.day);
                });
            } else if (sortingCriteria &&  sortingCriteria === 'frequency' && sortingOrder && sortingOrder === 'descending') {
                for (let i = 31; i >= 1; i--) { frequencies.push(i); }
            } else {
                for (let i = 1; i <= 31; i++) { frequencies.push(i); }
            }
            return frequencies;
        case FrequencyEnum.Monthly:
            if (sortingCriteria && sortingCriteria === 'valuesTotal') {
                data.forEach(element => {
                    if (!frequencies.find(m => m === element._id.month)) frequencies.push(element._id.month);
                });
            } else if (sortingCriteria && (sortingCriteria === 'values' || (groupingField && data.find(element => element._id[groupingField] === sortingCriteria)))) {
                data.forEach(element => {
                    if (!frequencies.find(m => m === element._id.month)) frequencies.push(element._id.month);
                });
            } else if (sortingCriteria && sortingCriteria === 'frequency' && sortingOrder && sortingOrder === 'descending') {
                for (let i = 12; i >= 1; i--) { frequencies.push(i); }
            }
            else { for (let i = 1; i <= 12; i++) { frequencies.push(i); }
            }
            return frequencies;
        case FrequencyEnum.Quartely:
            if (sortingCriteria && sortingCriteria === 'valuesTotal') {
                data.forEach(element => { frequencies.push(element._id.quarter); });
            } else if (sortingCriteria && (sortingCriteria === 'values' || (groupingField && data.find(element => element._id[groupingField] === sortingCriteria)))) {
                data.forEach(element => {
                    if (!frequencies.find(m => m === element._id.quarter)) frequencies.push(element._id.quarter);
                });
            } else if (sortingCriteria && sortingCriteria === 'frequency' && sortingOrder && sortingOrder === 'descending') {
                for (let i = 4; i >= 1; i--) { frequencies.push(i); }
            } else {
                for (let i = 1; i <= 4; i++) { frequencies.push(i); }
            }
            return frequencies;
        case FrequencyEnum.Yearly:
        if (sortingCriteria && sortingCriteria === 'valuesTotal') {
            data.forEach(element => { frequencies.push(element[0]._id.year); });
        } else if (sortingCriteria && (sortingCriteria === 'values' || (groupingField && data.find(element => element._id[groupingField] === sortingCriteria)))) {
            data.forEach(element => {
                if (!frequencies.find(m => m === element._id.year)) frequencies.push(element._id.year);
            });
        } else if (sortingCriteria && sortingCriteria === 'frequency' && sortingOrder && sortingOrder === 'descending') {
            data = orderBy(data, '_id.year', 'desc');
            data.forEach(element => {
                if (!frequencies.find(m => m === element._id.year)) frequencies.push(element._id.year);
            });
        }
        else if (sortingCriteria && sortingCriteria === 'frequency' && sortingOrder && sortingOrder === 'ascending') {
            data = orderBy(data, '_id.year', 'asc');
            data.forEach(element => {
                if (!frequencies.find(m => m === element._id.year)) frequencies.push(element._id.year);
            });
        }
        else {
            data.forEach(element => { frequencies.push(element._id.year); });
        }

        return frequencies;
        case FrequencyEnum.Weekly:
            return _getArrayFromRange(data , 1, 53, groupingField , sortingCriteria, sortingOrder);
    }
}

function _getArrayFromRange(data: any, from: number, to: number, groupingField: string , sortingCriteria , sortingOrder: string) {
    let i = from;
    let range: number[] = [];
    if (sortingCriteria && sortingCriteria === 'valuesTotal') {
        data.forEach(element => { range.push(element._id.week); });
        return range;
    } else if (sortingCriteria && (sortingCriteria === 'values' || (groupingField && data.find(e => e._id[groupingField] === sortingCriteria)))) {
        data.forEach(element => {
            if (!range.find(m => m === element._id.week)) range.push(element._id.week);
        });
        return range;
    } else if (sortingCriteria && sortingCriteria === 'frequency' && sortingOrder && sortingOrder === 'descending') {
        let i = to;
        while (i > from) { range.push(i); i--; }
    }
    else {
        let i = from;
        while (i < to) { range.push(i); i++; }
    }
    return range;
}