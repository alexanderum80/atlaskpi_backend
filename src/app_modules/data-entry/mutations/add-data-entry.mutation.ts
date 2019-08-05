import { map } from 'lodash';
import { CustomListService } from './../../../services/custom-list.service';
import { DataEntryResponse } from './../data-entry.types';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { DataSourcesService } from '../../../services/data-sources.service';
import { AddDataEntrySourcesActivity } from '../activities/add-data-entry-sources.activity';
import { IDataEntryInput } from '../data-entry.types';

@injectable()
@mutation({
    name: 'addDataEntry',
    activity: AddDataEntrySourcesActivity,
    parameters: [
        { name: 'input', type: IDataEntryInput, required: true },
    ],
    output: { type: DataEntryResponse }
})
export class AddDataEntryMutation extends MutationBase<DataEntryResponse> {
    constructor(
        @inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService,
        @inject(CustomListService.name) private _customListSvc: CustomListService,
    ) {
    super();
    }

    run(data: { input: IDataEntryInput }): Promise<DataEntryResponse> {
        const that = this;

        return new Promise<DataEntryResponse>((resolve, reject) => {
            this._dataSourcesSvc.addDataSource(data.input).then(newVirtualSource => {
                data.input.inputName = newVirtualSource.source;
                data.input.records = JSON.parse(data.input.records);

                const virtualSourceResponse: DataEntryResponse = {
                    _id: newVirtualSource.id,
                    name: newVirtualSource.name,
                    description: newVirtualSource.description,
                    dataSource: newVirtualSource.source,
                    fields: <any>newVirtualSource.fieldsMap,
                    filterOperators: <any>newVirtualSource.filterOperators || '',
                    dataEntry: newVirtualSource.dataEntry || false,
                    users: newVirtualSource.users || [],
                    createdBy: newVirtualSource.createdBy
                };

                that._dataSourcesSvc.createVirtualSourceMapCollection(data.input).then(res => {
                    virtualSourceResponse.invalidRows = JSON.stringify(res);
                    resolve(virtualSourceResponse);
                    return;
                });
            }).catch(err => {
                resolve(null);
                return;
            });
        });
    }
}
