import { IGetDataOptions } from '../../kpis/kpi-base';
import { IChartDateRange } from '../../../../models/common/date-range';
import { FrequencyEnum, IDateRange } from '../../../../models/common';


export interface IChartMetadata extends IGetDataOptions {
    xAxisSource?: string;
}