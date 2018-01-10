import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { input } from '../../../framework/decorators/input.decorator';
import { IChartDateRange } from '../../common/date-range';
import { IDashboardDocument } from '../dashboards/dashboard';
import { IKPIDocument } from '../kpis/kpi';

export interface IChart {
    // _id?: string;
    title: string;
    subtitle?: string;
    group?: string;
    kpis: [IKPIDocument];
    dateRange: [IChartDateRange];
    filter?: any;
    frequency?: string;
    groupings?: string[];
    xFormat?: string;
    yFormat?: string;
    chartDefinition: any;
    xAxisSource: string;
    comparison?: string[];
    dashboards?: IDashboardDocument[];
    targetList?: any[];
    futureTarget?: boolean;
    availableComparison?: string[];
}

export interface IChartInput {
    title: string;
    subtitle?: string;
    group?: string;
    kpis: [string];
    dateRange: [IChartDateRange];
    filter?: any;
    frequency?: string;
    groupings?: string[];
    xFormat?: string;
    yFormat?: string;
    chartDefinition: any;
    xAxisSource: string;
    comparison: string[];
    dashboards?: string[];
    isFutureTarget?: boolean;
    isDrillDown?: boolean;
}

export interface IGetChartInput {
    dateRange: [IChartDateRange];
    frequency: string;
    groupings: [string];
    xAxisSource: string;
    comparison?: [string];
    filter?: string;
    isDrillDown?: boolean;
    isFutureTarget?: boolean;
}

export interface IChartDocument extends IChart, mongoose.Document {
}

export interface IChartModel extends mongoose.Model<IChartDocument> {
    /**
     * Create a Chart
     * @param { IChartInput } input - and input object with the details of the chart
     * @returns {Promise<IChartDocument>}
     */
    createChart(input: IChartInput): Promise<IChartDocument>;
    /**
     * Update a Chart
     * @param { string } id - and input object with the details of the chart
     * @param { IChartInput } input - and input object with the details of the chart
     * @returns {Promise<IChartDocument>}
     */
    updateChart(id: string, input: IChartInput): Promise<IChartDocument>;

    listChartByGroup(group: string): Promise<IChartDocument[]>;

    getChartsGroup(): Promise<IChartDocument[]>;

}
