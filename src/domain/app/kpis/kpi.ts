import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { IPagedQueryResult, IPaginationDetails } from '../../../framework/queries/pagination';
import { IChartDateRange } from '../../common/date-range';
import { IChartDocument, IChart } from '../charts/chart';
import { Expenses } from '../expenses/expense.model';
import { Sales } from '../sales/sale.model';
import { IWidgetDocument, IWidget } from '../widgets/widget';
import { Inventory } from './../inventory/inventory.model';
import { IIdName } from '../../common/id-name';
import { IValueName } from '../../common/value-name';
import { ISearchableModel } from '../global-search/global-search';
import { IMapDocument } from '../maps/maps';
import { IMap } from '../dashboards/dashboard';



export enum KPITypeEnum {
    Simple = 'simple',
    Complex = 'complex',
    Compound = 'compound',
    ExternalSource = 'externalsource'
}

export const KPITypeMap = {
    simple: KPITypeEnum.Simple,
    complex: KPITypeEnum.Complex,
    compound: KPITypeEnum.Compound,
    externalsource: KPITypeEnum.ExternalSource
};

export function getKPITypePropName(type: KPITypeEnum) {
    switch (type) {
        case KPITypeEnum.Simple:
            return 'simple';
        case KPITypeEnum.Complex:
            return 'complex';
        case KPITypeEnum.Compound:
            return 'compound';
        case KPITypeEnum.ExternalSource:
            return 'externalsource';
    }
}

export interface IKPIDataSourceHelper {
    sales: Sales;
    expenses: Expenses;
    inventory: Inventory;
}

export interface IDocumentExist {
    chart?: IChart[];
    widget?: IWidget[];
    complexKPI?: IKPI[];
    maps?: IMap[];
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
    _id: any;
    code: string;
    name: string;
    baseKpi?: string;
    description?: string;
    groupings?: IValueName[];
    dateRange?: IChartDateRange;
    filter?: any;
    frequency?: string;
    axisSelection?: string;
    emptyValueReplacement?: string;
    composition?: string;
    type?: string;
    expression?: string;
    source?: string;
    availableGroupings?: string[];
    system?: boolean;
     // add-created
    createdBy?: any;
    createdDate?: Date;
    updatedBy?: any;
    updatedDate?: Date;
}

export interface IKPIDocument extends IKPI, mongoose.Document {
    groupingInfo: IValueName[];
}

export interface IKPIModel extends mongoose.Model<IKPIDocument>, ISearchableModel {
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
    removeKPI(id: string): Promise<IMutationResponse>;
}
