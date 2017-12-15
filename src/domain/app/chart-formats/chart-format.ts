import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { IPagedQueryResult, IPaginationDetails } from '../../../framework/queries/pagination';
import { IQueryResponse } from '../../../framework/queries/query-response';

export interface IChartFormat {
    name: string;
    type: string;
    typeFormat: {
        before: string,
        after: string,
        decimal: number,
        formula: string
    };
}

export interface IChartFormatDetails extends IChartFormat { }

export interface IChartFormatDocument extends IChartFormat, mongoose.Document {
    name: string;
    type: string;
    typeFormat: {
        before: string,
        after: string,
        decimal: number,
        formula: string
    };
}

export interface IChartFormatModel extends mongoose.Model<IChartFormatDocument> {
    createChartFormat(details: IChartFormatDetails): Promise<IMutationResponse>;

    getAllChartFormats(details?: IPaginationDetails): Promise<IPagedQueryResult<IChartFormat>>;

    getChartFormatById(id: string): Promise<IQueryResponse<IChartFormatDocument>>;

    updateChartFormat(id: string, details: IChartFormatDetails): Promise<IMutationResponse>;

    removeChartFormat(id: string): Promise<IMutationResponse>;
}
