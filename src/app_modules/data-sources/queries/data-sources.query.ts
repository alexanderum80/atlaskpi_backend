import { DataSourceSchemasMapping, DataSourcesHelper } from './datasource.helper';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
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
export class DataSourcesQuery extends QueryBase<DataSourceResponse[]> {
    constructor(@inject('DatasourceHelper') private _datasourceHelper: DataSourcesHelper) {
        super();
    }

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
