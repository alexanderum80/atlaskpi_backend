import { IChartDateRange } from '../../common/date-range';
import { IKPIDocument } from '../kpis';
import { IDateRange } from '../../common';
import { IMutationResponse } from '../../';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { IDashboardDocument } from '../dashboards';

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
    dashboards?: IDashboardDocument[];
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
    dashboards?: string[];
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
      detachFromAllDashboards(): Promise<boolean>;
      attachToDashboard(dashboards: string[]): Promise<IChartDocument>;
      appearsIn(): Promise<IDashboardDocument[]>;
}

export interface IChartModel extends mongoose.Model<IChartDocument> {
    /**
     * Create a Chart
     * @param { IChartInput } input - and input object with the details of the chart
     * @returns {Promise<IMutationResponse>}
     */
    createChart(input: IChartInput): Promise<IMutationResponse>;
    /**
     * Delete a Chart
     * @param { string } id - and input object with the details of the chart
     * @returns {Promise<IMutationResponse>}
     */
    deleteChart(id: string): Promise<IMutationResponse>;
    /**
     * Update a Chart
     * @param { string } id - and input object with the details of the chart
     * @param { IChartInput } input - and input object with the details of the chart
     * @returns {Promise<IMutationResponse>}
     */
    updateChart(id: string, input: IChartInput): Promise<IMutationResponse>;
}
