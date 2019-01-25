import { GetDataEntryCollectionActivity } from './../activities/get-data-entry-collection.activity';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { DataSourcesService } from '../../../services/data-sources.service';


@injectable()
@query({
    name: 'dataEntryCollection',
    activity: GetDataEntryCollectionActivity,
    output: { type: String }
})
export class DataEntryCollectionQuery implements IQuery<string> {
    constructor(@inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService) { }

    async run(): Promise<string> {
        return this._dataSourcesSvc.getDataEntryCollection() as any;
    }
}