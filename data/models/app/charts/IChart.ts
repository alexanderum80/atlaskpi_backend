import { IKPIDocument } from '../kpis';
import { IDateRange } from '../../common';
import { IMutationResponse } from '../../';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IChartDateRange {
    predefined?: string;
    custom?: IDateRange;
}

export interface IChart {
    _id: string;
    title: string;
    subtitle?: string;
    group: string;
    kpis: [IKPIDocument];
    dateRange: IChartDateRange;
    frequency: string;
    groupings: string[];
    xFormat?: string;
    yFormat?: string;
    chartDefinition: any;
}

// export interface IChartDetails {
//     title: string;
//     subtitle: string;
//     group: string;
//     frequency: string;
//     kpis: string[];
//     chartFormat: string;
//     dataRange: IChartDateRange;
// }

export interface IChartDocument extends IChart, mongoose.Document {
      hasKpi(kpi: string, done: (err: any, hasKpi: boolean) => void): void;
      addKpi(kpi: string, done?: (err: any, kpi: IKPIDocument) => void): void;
}

export interface IChartModel extends mongoose.Model<IChartDocument> {
    /**
     * Create a Chart
     */
    createChart(details: IChartDetails): Promise<IMutationResponse>;
}
