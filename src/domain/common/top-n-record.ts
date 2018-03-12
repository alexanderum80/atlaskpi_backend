import { isNumber } from 'lodash';
import {FrequencyEnum} from './frequency-enum';

export enum EnumTopNRecord {
    TOP5 = 'top 5',
    TOP10 = 'top 10',
    TOP15 = 'top 15'
}

export const PredefinedTopNRecords = {
    top5: EnumTopNRecord.TOP5,
    top10: EnumTopNRecord.TOP10,
    top15: EnumTopNRecord.TOP15
};


export interface IChartTopNRecord {
    predefinedNRecord: string;
    customNRecord: number;
}


export function chartTopValue(topNRecord: IChartTopNRecord): number {
    const isTopCustom = (topNRecord.predefinedNRecord === 'other' || topNRecord.predefinedNRecord === 'Other') &&
                      isNumber(topNRecord.customNRecord);
    if (isTopCustom) {
        return topNRecord.customNRecord;
    }

    switch (topNRecord.predefinedNRecord) {
        case EnumTopNRecord.TOP5:
            return 5;
        case EnumTopNRecord.TOP10:
            return 10;
        case EnumTopNRecord.TOP15:
            return 15;
        default:
            return 20;
    }
}

export function chartTopMomentFormat(frequency?: number): string {
    switch (frequency) {
        case FrequencyEnum.Daily:
        case FrequencyEnum.Weekly:
            return 'D';
        case FrequencyEnum.Monthly:
            return 'YYYY-DD';
        case FrequencyEnum.Quartely:
            return 'Q';
        case FrequencyEnum.Yearly:
            return 'YYYY';
        default:
            return '';
    }
}