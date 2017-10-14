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
    owner: IUser;
    users: IUser[];

    // widgets: IWidget[];
}

export interface IDashboardDocument extends IDashboard, mongoose.Document {
    // hasChart(chart: string | IChartDocument): boolean;
    // addChart(id: string): Promise<IChartDocument>;
    // removeChart(id: string): Promise<boolean>;

    // addChart(chartId: string, done?: (err: any, chart: IChartDocument) => void): void;
    // removeChart(chartId: string, done: (err: any, dashboard: IDashboardDocument) => void): void;
}

export interface IDashboardModel extends mongoose.Model<IDashboardDocument> {
    createDashboard(name: string, description: string, group: string, charts: string[]): Promise<IDashboardDocument>;
    updateDashboard(_id: string, name: string, description: string, group: string, charts: string[]): Promise<IDashboardDocument>;
    deleteDashboard(_id: string): Promise<IDashboardDocument>;
 }