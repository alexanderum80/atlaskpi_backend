import { isNumber } from 'lodash';
import {FrequencyEnum} from './frequency-enum';

export enum EnumChartTop {
    TOP5 = 'top 5',
    TOP10 = 'top 10',
    TOP15 = 'top 15'
}

export const PredefinedTops = {
    top5: EnumChartTop.TOP5,
    top10: EnumChartTop.TOP10,
    top15: EnumChartTop.TOP15
};


export interface IChartTop {
    predefinedTop: string;
    customTop: number;
}


export function chartTopValue(top: IChartTop): number {
    const isTopCustom = (top.predefinedTop === 'other' || top.predefinedTop === 'Other') &&
                      isNumber(top.customTop);
    if (isTopCustom) {
        return top.customTop;
    }

    switch (top.predefinedTop) {
        case EnumChartTop.TOP5:
            return 5;
        case EnumChartTop.TOP10:
            return 10;
        case EnumChartTop.TOP15:
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