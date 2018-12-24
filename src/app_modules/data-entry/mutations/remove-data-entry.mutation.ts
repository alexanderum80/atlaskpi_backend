import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { RemoveDataEntrySourcesActivity } from '../activities/remove-data-entry-sources.activity';
import { DataSourcesService } from '../../../services/data-sources.service';
import { VirtualSources } from '../../../domain/app/virtual-sources/virtual-source.model';
import { DataEntryMutationResponse } from '../data-entry.types';

@injectable()
@mutation({
    name: 'removeDataEntry',
    activity: RemoveDataEntrySourcesActivity,
    parameters: [
        { name: 'name', type: String, required: true },
    ],
    output: { type: DataEntryMutationResponse }
})
export class RemoveDataEntryMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(VirtualSources.name) private _virtualSourceModel: VirtualSources,
        @inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService,
    ) {
    super();
    }

    run(data: { name: string }): Promise<IMutationResponse> {
        const that = this;

        // resolve kpis
        return new Promise<IMutationResponse>((resolve, reject) => {

            that._virtualSourceModel.model.removeDataSources(data.name).then(virtualSource => {
                that._dataSourcesSvc.removeVirtualSourceMapCollection(virtualSource.source).then(deletedConnector => {
                    resolve({
                        success: true,
                        entity: deletedConnector
                    });
                }).catch(err => {
                    resolve({
                        success: false,
                        errors: [
                            {
                                field: 'general',
                                errors: ['There was an error removing virtual source collection']
                            }
                        ]
                    });
                });
            }).catch(err => {
                    resolve({
                        success: false,
                        errors: [
                            {
                                field: 'general',
                                errors: ['There was an error removing the data source']
                            }
                        ]
                    });
            });
        });
    }
}
