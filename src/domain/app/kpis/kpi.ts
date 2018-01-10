import { Inventory } from './../inventory/inventory.model';
import { Expenses } from '../expenses/expense.model';
import { Sales } from '../sales/sale.model';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { IPagedQueryResult, IPaginationDetails } from '../../../framework/queries/pagination';
import { IChartDateRange } from '../../common/date-range';
import { IWidgetDocument } from '../widgets/widget';
import { IChartDocument } from '../charts/chart';

import { IWidgetDocument } from '../widgets/widget';
import { Inventory } from './../inventory/inventory.model';


export enum KPITypeEnum {
    Simple = 'simple',
    Complex = 'complex',
    Compound = 'compound'
    GoogleAnalytics = 'googleanalytics'
}

export const KPITypeMap = {
    simple: KPITypeEnum.Simple,
    complex: KPITypeEnum.Complex,
    compound: KPITypeEnum.Compound,
    googleanalytics: KPITypeEnum.GoogleAnalytics
};

export function getKPITypePropName(type: KPITypeEnum) {
    switch (type) {
        case KPITypeEnum.Simple:
            return 'simple';
        case KPITypeEnum.Complex:
            return 'complex';
        case KPITypeEnum.Compound:
            return 'compound';
        case KPITypeEnum.GoogleAnalytics:
            return 'googleanalytics';
    }
}

export interface IDocumentExist {
    chart?: IChartDocument[];
    widget?: IWidgetDocument[];
}

export interface IKPIDataSourceHelper {
    sales: Sales;
    expenses: Expenses;
    inventory: Inventory;
}

export interface IDocumentExist {
    chart?: IChartDocument[];
    widget?: IWidgetDocument[];
}

export interface IKPIDataSourceHelper {
    sales: Sales;
    expenses: Expenses;
    inventory: Inventory;
}

export interface IKPIFilter {
    order?: number;
    field: string;
    operator: string;
    criteria: string;
}

export interface IKPISimpleDefinition {
    dataSource: string; // collection (or connectorId in the case of google analytics)
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
    removeKPI(id: string, documentExists?: IDocumentExist): Promise<IMutationResponse>;
}
