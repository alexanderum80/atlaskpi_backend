import { IChartDateRange } from '../../../../models/app/charts';
import { FrequencyEnum, IDateRange } from '../../../../models/common';

export interface IChartMetadata {
    dateRange: IChartDateRange;
    frequency?: FrequencyEnum;
    grouping?: string;
    xAxisSource?: string;
}