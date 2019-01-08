import { camelCase } from 'lodash';
import { DataEntryMutationResponse } from '../data-entry.types';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { DataSourcesService } from '../../../services/data-sources.service';
import { UpdateDataEntryCollectionActivity } from '../activities/update-data-entry-collection.activity';
import { VirtualSources } from '../../../domain/app/virtual-sources/virtual-source.model';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';

@injectable()
@mutation({
    name: 'updateDataEntry',
    activity: UpdateDataEntryCollectionActivity,
    parameters: [
        { name: 'input', type: String, required: true },
    ],
    output: { type: DataEntryMutationResponse }
})
export class UpdateDataEntryMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService,
        @inject(VirtualSources.name) private _virtualSourceSvc: VirtualSources,
    ) {
    super();
    }

    run(data: { input: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            const dataInput = JSON.parse(data.input);

            const fileExtensionIndex = dataInput.inputName.lastIndexOf('.') !== -1 ? dataInput.inputName.lastIndexOf('.') : dataInput.inputName.length;
            dataInput.inputName = camelCase(dataInput.inputName.substr(0, fileExtensionIndex)).toLowerCase();

            this._virtualSourceSvc.model.getDataSourceByName(dataInput.inputName).then(virtualSource => {
                that._dataSourcesSvc.removeVirtualSourceMapCollection(virtualSource.source).then(() => {
                    dataInput.inputName = virtualSource.source;
                    dataInput.fields = JSON.parse(dataInput.fields);
                    dataInput.records = JSON.parse(dataInput.records);

                    that._dataSourcesSvc.createVirtualSourceMapCollection(dataInput).then(() => {
                        resolve({ success: true });
                        return;
                    });
                });
            }).catch(err => {
                resolve(null);
            });
        });
    }
}
