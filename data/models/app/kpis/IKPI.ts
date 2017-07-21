import { IMutationResponse } from '../../';
import { IChartDateRange, IPagedQueryResult, IPaginationDetails, IQueryResponse } from '../../common';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IKPI {
    code: string;
    name: string;
    description?: string;
    groupings?: string[];
    dateRange: IChartDateRange;
    filter: any;
    frequency: string;
    axisSelection: string;
    emptyValueReplacement: string;
    composition: any[];
}

export interface IKPIDetails extends IKPI { }

export interface IKPIDocument extends IKPI, mongoose.Document { }

export interface IKPIModel extends mongoose.Model<IKPIDocument> {
    /**
     * Get all kpis by page
     * @param { IPaginationDetails }  details - pagination details
     */
    getAllKPIs(details?: IPaginationDetails): Promise<IPagedQueryResult<IKPI>>;

    /**
     * Create a KPI providing all its elements
     */
    createKPI(data: IKPIDetails): Promise<IMutationResponse>;

    /**
     * Update a KPI by its id
     */
    updateKPI(id: string, data: IKPIDetails): Promise<IMutationResponse>;

     /**
     * Remove a KPI by its id
     */
    removeKPI(id: string): Promise<IMutationResponse>;
}
