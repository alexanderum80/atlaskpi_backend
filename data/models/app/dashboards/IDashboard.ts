import { IChart, IChartDocument } from '../charts';
// import { IWidget } from '../widgets';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IDashboard {
    name: string;
    group: string;
    charts: IChart[];
    // widgets: IWidget[];
}

export interface IDashboardDocument extends IDashboard, mongoose.Document {
    // hasChart(chart: string | IChartDocument): boolean;
    // addChart(id: string): Promise<IChartDocument>;
    // removeChart(id: string): Promise<boolean>;

    hasChart(chartId: string, done: (err: any, hasChart: boolean) => void): void;
    addChart(chartId: string, done?: (err: any, chart: IChartDocument) => void): void;
    removeChart(chartId: string, done: (err: any, dashboard: IDashboardDocument) => void): void;
}

export interface IDashboardModel extends mongoose.Model<IDashboardDocument> { }