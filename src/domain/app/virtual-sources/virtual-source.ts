
import * as mongoose from 'mongoose';
import { DataSourceResponse } from '../../../app_modules/data-sources/data-sources.types';

export interface IFieldMetadata {
    path: string;
    dataType: string;
    allowGrouping: boolean;
}

export interface IVirtualSourceFields {
    [key: string]: IFieldMetadata;
}

export interface IVirtualSource {
    name: string;
    description?: string;
    source: string;
    modelIdentifier: string;
    dateField: string;
    aggregate: any[];
    fieldsMap: IVirtualSourceFields;
}

export interface IVirtualSourceDocument extends IVirtualSource, mongoose.Document {
    getGroupings(): string[];
}

export interface IVirtualSourceModel extends mongoose.Model<IVirtualSourceDocument> {
    getDataSources(): Promise<DataSourceResponse[]>;
}
