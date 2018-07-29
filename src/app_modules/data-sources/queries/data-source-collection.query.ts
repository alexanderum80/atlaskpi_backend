import { GraphQLTypesMap } from './../../../framework/decorators/graphql-types-map';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetDataSourcesCollectionActivity } from './../activities/get-data-source-collection.activity';
import { DataSourceResponse } from '../data-sources.types';
import { DataSourcesService } from '../../../services/data-sources.service';


@injectable()
@query({
    name: 'dataSourceCollection',
    activity: GetDataSourcesCollectionActivity,
    parameters: [
        { name: 'name', type: String },
    ],
    output: { type: String }
})
export class DataSourceCollectionQuery implements IQuery<String> {
    constructor(@inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService) { }

    async run(data: { name: string }): Promise<string> {
        return await this._dataSourcesSvc.getVirtualSourceMapCollection(data.name) as any;
    }
}