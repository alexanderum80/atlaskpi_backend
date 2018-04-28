
import * as mongoose from 'mongoose';
import { DataSourceResponse } from '../../../app_modules/data-sources/data-sources.types';
import { IValueName } from '../../common/value-name';

export interface IFieldMetadata {
    path: string;
    dataType: string;
    allowGrouping: boolean;
}

export interface IVirtualSourceFields {
    [key: string]: IFieldMetadata;
}

export interface IFilterOperator {
    description: string;
    name: string;
    oper: string;
    exp: string;
    listSeparator: string;
}

export interface IDataTypeFilters {
    Number: IFilterOperator[];
    String: IFilterOperator[];
}

export interface IVirtualSource {
    name: string;
    description?: string;
    sourceCollection?: string;
    source: string;
    modelIdentifier: string;
    dateField: string;
    aggregate: any[];
    fieldsMap: IVirtualSourceFields;
    externalSource?: boolean;
    filterOperators?: IDataTypeFilters;
}

export interface IVirtualSourceDocument extends IVirtualSource, mongoose.Document {
    getGroupingFieldPaths(): IValueName[];
    // containsPath(path: string): boolean;
}

export interface IVirtualSourceModel extends mongoose.Model<IVirtualSourceDocument> {
    getDataSources(names?: string[]): Promise<DataSourceResponse[]>;
    findByNames(names: string): Promise<IVirtualSourceDocument[]>;
}
