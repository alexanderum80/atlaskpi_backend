import * as mongoose from 'mongoose';

export interface IDataSourceField {
    path: string;
    type: string;
}

export interface IFieldsMap {
    [name: string]: IDataSourceField;
}

export interface IDataSource {
    name: string;
    dateField: string;
    fieldsMap: IFieldsMap;
    aggregates: any[];
}

export interface IDataSourceDocument extends IDataSource, mongoose.Document {

}

export interface IDataSourceModel extends mongoose.Model<IDataSourceDocument> {
    
}