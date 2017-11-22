import { IWidget } from './../widgets/IWidget';
import { IUser } from '../users/IUser';
import { IChart, IChartDocument } from '../charts';
// import { IWidget } from '../widgets';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IDashboard {
    name: string;
    description: string;
    group: string;
    charts: IChart[];
    widgets: IWidget[];
    owner: IUser;
    users: IUser[];
}

export interface IDashboardInput {
    name: string;
    description: string;
    group: string;
    charts: string[];
    widgets: string[];
    users: string[];
}


export interface IDashboardDocument extends IDashboard, mongoose.Document {
    // hasChart(chart: string | IChartDocument): boolean;
    // addChart(id: string): Promise<IChartDocument>;
    // removeChart(id: string): Promise<boolean>;

    // addChart(chartId: string, done?: (err: any, chart: IChartDocument) => void): void;
    // removeChart(chartId: string, done: (err: any, dashboard: IDashboardDocument) => void): void;
}

export interface IDashboardModel extends mongoose.Model<IDashboardDocument> {
    createDashboard(input: IDashboardInput): Promise<IDashboardDocument>;
    updateDashboard(id: string, input: IDashboardInput): Promise<IDashboardDocument>;
    deleteDashboard(id: string): Promise<IDashboardDocument>;
 }