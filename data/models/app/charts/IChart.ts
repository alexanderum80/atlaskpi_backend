import { IChartDateRange } from '../../common/date-range';
import { IKPIDocument } from '../kpis';
import { IDateRange } from '../../common';
import { IMutationResponse } from '../../';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IChart {
    // _id?: string;
    title: string;
    subtitle?: string;
    group?: string;
    kpis: [IKPIDocument];
    dateRange: IChartDateRange;
    filter?: any;
    frequency?: string;
    groupings?: string[];
    xFormat?: string;
    yFormat?: string;
    chartDefinition: any;
    xAxisSource: string;
}

export interface IChartInput {
    title: string;
    subtitle?: string;
    group?: string;
    kpis: [string];
    dateRange: IChartDateRange;
    filter?: any;
    frequency?: string;
    groupings?: string[];
    xFormat?: string;
    yFormat?: string;
    chartDefinition: any;
    xAxisSource: string;
}

export interface IGetChartInput {
    dateRange: IChartDateRange;
    frequency: string;
    groupings: [string];
    xAxisSource: string;
    filter?: string;
}

export interface IChartDocument extends IChart, mongoose.Document {
      hasKpi(kpi: string | IKPIDocument): boolean;
      addKpi(kpi: string): Promise<IKPIDocument>;
}

export interface IChartModel extends mongoose.Model<IChartDocument> {
    /**
     * Create a Chart
     */
    createChart(input: IChartInput): Promise<IMutationResponse>;
}
