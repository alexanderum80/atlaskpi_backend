import { GetDataSourceByNameActivity } from './../activities/get-data-source-by-name.activity';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { DataSourceResponse } from '../data-sources.types';
import { DataSourcesService } from '../../../services/data-sources.service';


@injectable()
@query({
    name: 'dataSourceByName',
    activity: GetDataSourceByNameActivity,
    parameters: [
        { name: 'name', type: String },
    ],
    output: { type: DataSourceResponse }
})
export class DataSourceByNameQuery implements IQuery<DataSourceResponse> {
    constructor(@inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService) { }

    async run(data: { name: string }): Promise<DataSourceResponse> {
        return this._dataSourcesSvc.dataSourceByName(data.name) as any;
    }
}