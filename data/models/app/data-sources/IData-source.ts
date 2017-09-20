export interface IDataSourceField {
    path: string;
    type: string;
}

export interface IDataSource {
    name: string;
    fields: IDataSourceField[];
    groupings?: string[];
}
