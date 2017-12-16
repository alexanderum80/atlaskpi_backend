import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetDataSourcesActivity } from '../activities/get-data-sources.activity';
import { DataSourceResponse } from '../data-sources.types';
import { DataSourceSchemasMapping, DataSourcesHelper } from './datasource.helper';

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
    constructor(@inject(DataSourcesHelper.name) private _datasourceHelper: DataSourcesHelper) { }

    run(data: { filter: string,  }): Promise<DataSourceResponse[]> {
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
