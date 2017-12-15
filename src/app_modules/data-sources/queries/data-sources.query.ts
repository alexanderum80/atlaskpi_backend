import { DataSourceSchemasMapping, DataSourcesHelper } from './datasource.helper';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { DataSourceResponse } from '../data-sources.types';
import { GetDataSourcesActivity } from '../activities';

@injectable()
@query({
    name: 'dataSources',
    activity: GetDataSourcesActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: DataSourceResponse, isArray: true }
})
export class DataSourcesQuery implements IQuery<DataSourceResponse[]> {
    constructor() { }

    run(data: { filter: String,  }): Promise<DataSourceResponse[]> {
        const that = this;
        const dataSources = DataSourceSchemasMapping.map(s => {
            return {
                name: s.name,
                fields: DataSourcesHelper.GetFieldsFromSchemaDefinition(s.definition),
                groupings: DataSourcesHelper.GetGroupingsForSchema(s.name)
            };
        });

        return Promise.resolve(dataSources);
    }
}
