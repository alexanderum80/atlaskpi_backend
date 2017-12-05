import { IMutationResponse } from '../../';
import { IChartDateRange, IPagedQueryResult, IPaginationDetails, IQueryResponse } from '../../common';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { IChartDocument } from '../charts';

export enum KPITypeEnum {
    Simple,
    Complex,
    Compound
}

export const KPITypeMap = {
    simple: KPITypeEnum.Simple,
    complex: KPITypeEnum.Complex,
    compound: KPITypeEnum.Compound,
};

export function getKPITypePropName(type: KPITypeEnum) {
    switch (type) {
        case KPITypeEnum.Simple:
            return 'simple';
        case KPITypeEnum.Complex:
            return 'complex';
        case KPITypeEnum.Compound:
            return 'compound';
    }
}

export interface IKPIFilter {
    order?: number;
    field: string;
    operator: string;
    criteria: string;
}

export interface IKPISimpleDefinition {
    dataSource: string;
    function: string;
    field: string;
    operator?: string;
    value?: string;
}

export interface IKPI {
    code: string;
    name: string;
    baseKpi?: string;
    description?: string;
    groupings?: string[];
    dateRange?: IChartDateRange;
    filter?: any;
    frequency?: string;
    axisSelection?: string;
    emptyValueReplacement?: string;
    composition?: string;
    type?: string;
    expression?: string;
    availableGroupings: string[];
}

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
    createKPI(input: IKPI): Promise<IKPIDocument>;

    /**
     * Update a KPI by its id
     */
    updateKPI(id: string, input: IKPI): Promise<IKPIDocument>;

     /**
     * Remove a KPI by its id
     */
    removeKPI(id: string, chartExist?: IChartDocument[]): Promise<IMutationResponse>;
}
