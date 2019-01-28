import { GetDataEntryByIdActivity } from '../activities/get-data-entry-by-id.activity';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { DataSourcesService } from '../../../services/data-sources.service';


@injectable()
@query({
    name: 'dataEntryByIdMapCollection',
    activity: GetDataEntryByIdActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: String }
})
export class DataEntryByIdMapCollectionQuery implements IQuery<string> {
    constructor(@inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService) { }

    async run(data: { id: string }): Promise<string> {
        return this._dataSourcesSvc.getVirtualSourceByIdMapCollection(data.id) as any;
    }
}