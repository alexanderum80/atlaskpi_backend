import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IDataSourceField {
    path: string;
    type: string;
}

export interface IDataSource {
    name: string;
    fields: IDataSourceField[];
}
