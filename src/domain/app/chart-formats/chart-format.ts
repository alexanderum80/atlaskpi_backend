import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { IMutationResponse, IPagedQueryResult, IPaginationDetails, IQueryResponse } from '../../common';
// {
//   name: "string",
//   type: "string, date, number",

//   typeFormat: {
//     before: "",
//     afer: "",
//     decimal: 0,
//     formula: ""
//   }
// }
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
