import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { DataSourcesService } from '../../../services/data-sources.service';
import { GetFieldsWithData } from '../activities/get-fields-with-data.activity';
import { DataSourceField, DataSourceResponse } from '../data-sources.types';


@injectable()
@query({
    name: 'fieldsWithData',
    activity: GetFieldsWithData,
    parameters: [
        { name: 'source', type: String, required: true },
    ],
    output: { type: DataSourceField, isArray: true }
})
export class GetFieldsWithDataQuery implements IQuery<DataSourceResponse[]> {
    constructor(@inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService) { }

    async run(data: { source: string }): Promise<DataSourceResponse[]> {
        return await this._dataSourcesSvc.getKPIFilterFieldsWithData(data.source) as any;
    }
}