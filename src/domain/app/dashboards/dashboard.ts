import { ISearchableModel } from '../global-search/global-search';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { IChart } from '../charts/chart';
import { IUser } from '../security/users/user';
import { IWidget } from '../widgets/widget';


// import { IWidget } from '../widgets';

export interface IDashboard {
    name: string;
    description: string;
    charts: IChart[];
    widgets: IWidget[];
    owner: IUser;
    users: IUser[];
    visible?: boolean;
}

export interface IDashboardInput {
    name: string;
    description: string;
    charts: string[];
    widgets: string[];
    owner: string;
    users: string[];
    visible?: boolean;
}

export interface IDashboardDocument extends IDashboard, mongoose.Document {
    // hasChart(chart: string | IChartDocument): boolean;
    // addChart(id: string): Promise<IChartDocument>;
    // removeChart(id: string): Promise<boolean>;

    // addChart(chartId: string, done?: (err: any, chart: IChartDocument) => void): void;
    // removeChart(chartId: string, done: (err: any, dashboard: IDashboardDocument) => void): void;
}

export interface IDashboardModel extends mongoose.Model<IDashboardDocument>, ISearchableModel {
    createDashboard(input: IDashboardInput): Promise<IDashboardDocument>;
    updateDashboard(id: string, input: IDashboardInput): Promise<IDashboardDocument>;
    updateVisibleDashboard(id: string, input: Boolean): Promise<IDashboardDocument>;
    adduserDashboard(id: string, input: String): Promise<IDashboardDocument>;
    deleteDashboard(id: string): Promise<IDashboardDocument>;
    findDashboardByChartId(id: string): Promise<string>;
    deleteWidget(dashboardId: string, widgetId: string): Promise<IDashboardDocument>;
 }