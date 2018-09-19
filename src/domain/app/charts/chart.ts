import { ISearchableModel } from '../global-search/global-search';
import { IObject } from '../../../app_modules/shared/criteria.plugin';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { input } from '../../../framework/decorators/input.decorator';
import { IChartDateRange } from '../../common/date-range';
import { IDashboardDocument } from '../dashboards/dashboard';
import { IKPIDocument } from '../kpis/kpi';
import {IChartTop} from '../../common/top-n-record';

export interface IChart {
    // _id?: string;
    title: string;
    subtitle?: string;
    group?: string;
    kpis: IKPIDocument[];
    dateRange: IChartDateRange[];
    top?: IChartTop;
    filter?: any;
    frequency?: string;
    groupings?: string[];
    sortingCriteria?: string;
    sortingOrder?: string;
    xFormat?: string;
    yFormat?: string;
    chartDefinition: any;
    xAxisSource: string;
    comparison?: string[];
    dashboards?: IDashboardDocument[];
    targetList?: any[];
    targetExtraPeriodOptions?: IObject;
    canAddTarget?: boolean;
    futureTarget?: boolean;
    availableComparison?: string[];
}

export interface IChartInput {
    title: string;
    subtitle?: string;
    group?: string;
    kpis: [string];
    dateRange: [IChartDateRange];
    top?: IChartTop;
    filter?: any;
    frequency?: string;
    groupings?: string[];
    sortingCriteria?: string;
    sortingOrder?: string;
    xFormat?: string;
    yFormat?: string;
    chartDefinition: any;
    xAxisSource: string;
    comparison: string[];
    dashboards?: string[];
    isFutureTarget?: boolean;
    isDrillDown?: boolean;
    originalFrequency?: string;
}

export interface IGetChartInput {
    dateRange: [IChartDateRange];
    frequency: string;
    groupings: [string];
    sortingCriteria?: string;
    sortingOrder?: string;
    xAxisSource: string;
    comparison?: [string];
    filter?: string;
    isDrillDown?: boolean;
    isFutureTarget?: boolean;
}

export interface IChartDocument extends IChart, mongoose.Document {
    isStacked(): boolean;
}

export interface IChartModel extends mongoose.Model<IChartDocument>, ISearchableModel {
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
