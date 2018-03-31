import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetDataSourcesActivity } from '../activities/get-data-sources.activity';
import { DataSourceResponse } from '../data-sources.types';
import { DataSourceSchemasMapping, DataSourcesHelper } from './datasource.helper';
import { DataSourcesService } from '../../../services/data-sources.service';


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
    constructor(@inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService) { }

    async run(data: { filter: string }): Promise<DataSourceResponse[]> {
        return this._dataSourcesSvc.get() as any;
    }
}