import { IGetDataOptions } from '../../../kpis/queries/kpi-base';

export interface IChartMetadata extends IGetDataOptions {
    onTheFly?: boolean;
    xAxisSource?: string;
}