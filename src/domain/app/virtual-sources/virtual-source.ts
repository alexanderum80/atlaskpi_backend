import { IDataEntryInput } from './../../../app_modules/data-entry/data-entry.types';
import * as mongoose from 'mongoose';
import { DataSourceField, DataSourceResponse } from '../../../app_modules/data-sources/data-sources.types';
import { IValueName } from '../../common/value-name';
import { ErrorDetails } from '../../../framework/graphql/common.types';

export interface IFieldMetadata {
    path: string;
    dataType: string;
    allowGrouping?: boolean;
}

export interface IVirtualSourceFields {
    [key: string]: IFieldMetadata;
}

export interface IFilterOperator {
    description: string;
    name: string;
    operator: string;
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
    dataEntry: boolean;
    users: string[];
}

export class IVirtualSourceModelInput {
    field: string;
    dataType: string;
}

export class IVirtualSourceInput {
    name: string;
    fields: IVirtualSourceModelInput[];
    data: any[];
}

export class IVirtualSourceResponse {
    success: boolean;
    error: ErrorDetails;
}

export interface IVirtualSourceDocument extends IVirtualSource, mongoose.Document {
    getGroupingFieldPaths(): IValueName[];
    getFieldDefinition(fieldName: string);
    getDataTypeOperator(dataType: string, filterName: string): IFilterOperator;
    mapDataSourceFields(virtualSource: IVirtualSourceDocument): DataSourceField[];
    getDistinctValues(
        vs: IVirtualSourceDocument,
        fieldName: string,
        limit: number,
        filter: string,
        collectionSource?: string[]): Promise<string[]>;
    // containsPath(path: string): boolean;
}

export interface IVirtualSourceModel extends mongoose.Model<IVirtualSourceDocument> {
    addDataSources(data: any): Promise<IVirtualSourceDocument>;
    removeDataSources(name: string): Promise<IVirtualSourceDocument>;
    getDataSources(names?: string[]): Promise<DataSourceResponse[]>;
    getDataEntry(userId: string): Promise<DataSourceResponse[]>;
    getDataSourceByName(name: string): Promise<IVirtualSourceDocument>;
    getDataSourceById(id: string): Promise<IVirtualSourceDocument>;
    findByNames(names: string): Promise<IVirtualSourceDocument[]>;
}
