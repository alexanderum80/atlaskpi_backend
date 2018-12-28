import { GetDataEntrySourcesActivity } from '../activities/get-data-entry-sources.activity';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { DataSourceResponse } from '../../data-sources/data-sources.types';
import { DataSourcesService } from '../../../services/data-sources.service';


@injectable()
@query({
    name: 'dataEntries',
    activity: GetDataEntrySourcesActivity,
    output: { type: DataSourceResponse, isArray: true }
})
export class DataEntryQuery implements IQuery<DataSourceResponse[]> {
    constructor(@inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService) { }

    async run(): Promise<DataSourceResponse[]> {
        return this._dataSourcesSvc.getDataEntry() as any;
    }
}