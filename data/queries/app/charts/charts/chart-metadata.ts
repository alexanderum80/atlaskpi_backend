import { FrequencyEnum } from '../../../../models/common';

export interface IChartMetadata {
    frequency?: FrequencyEnum;
    grouping?: string;
    xAxisSource?: string;
}