import { IChartDateRange } from '../../common/date-range';
import * as mongoose from 'mongoose';
import { ISearchableModel } from '../global-search/global-search';
import { FunnelInput } from '../../../app_modules/funnels/funnels.types';

export interface IFunnel {
    // _id?: string;
    name: string;
    stages: IFunnelStage[];

    createdBy?: string;
    updatedBy?: string;
    createdDate?: Date;
    updatedDate?: Date;
}

export interface IFunnelStage {
    _id?: string;
    order: number;
    name: string;
    kpi: string;
    dateRange: IChartDateRange;
    fieldsToProject?: string[];
    compareToStage?: string;
    foreground: string;
    background: string;
}

export interface IFunnelDocument extends IFunnel, mongoose.Document { }

export interface IFunnelModel extends mongoose.Model<IFunnelDocument>, ISearchableModel {
    createFunnel(input: FunnelInput): Promise<IFunnelDocument>;
    updateFunnel(id: string, input: FunnelInput): Promise<IFunnelDocument>;
    deleteFunnel(id: string): Promise<IFunnelDocument>;
    listFunnels(): Promise<IFunnelDocument[]>;
    funnelById(id: string): Promise<IFunnelDocument>;

}