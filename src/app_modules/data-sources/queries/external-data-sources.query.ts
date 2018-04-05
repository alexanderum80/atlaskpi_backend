import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetExternalDataSourcesActivity } from '../activities/get-external-data-sources.activity';
import { ExternalDataSourcesService } from './../../../services/external-data-sources.service';
import { ExternalDataSourceResponse } from './../data-sources.types';

@injectable()
@query({
    name: 'externalDataSources',
    activity: GetExternalDataSourcesActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: ExternalDataSourceResponse, isArray: true }
})
export class ExternalDataSourcesQuery implements IQuery<ExternalDataSourceResponse[]> {
    constructor(
        @inject(ExternalDataSourcesService.name) private _externalDataSourcesService: ExternalDataSourcesService
    ) { }

    async run(data: { filter: string }): Promise<ExternalDataSourceResponse[]> {
        return await this._externalDataSourcesService.get();
    }
}