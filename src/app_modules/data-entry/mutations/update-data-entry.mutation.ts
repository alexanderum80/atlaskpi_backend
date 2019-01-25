import { camelCase } from 'lodash';
import { DataEntryMutationResponse } from '../data-entry.types';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { DataSourcesService } from '../../../services/data-sources.service';
import { UpdateDataEntryCollectionActivity } from '../activities/update-data-entry-collection.activity';
import { VirtualSources, transformFieldsToRealTypes } from '../../../domain/app/virtual-sources/virtual-source.model';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { Schema } from 'mongoose';

@injectable()
@mutation({
    name: 'updateDataEntry',
    activity: UpdateDataEntryCollectionActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: String, required: true },
    ],
    output: { type: DataEntryMutationResponse }
})
export class UpdateDataEntryMutation extends MutationBase<IMutationResponse> {
    constructor(
        // @inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService,
        @inject(VirtualSources.name) private _virtualSourceSvc: VirtualSources,
    ) {
    super();
    }

    async run(data: { id: string, input: string }): Promise<IMutationResponse> {
        try {
            const dataInput = JSON.parse(data.input);
            const vs = await this._virtualSourceSvc.model.findOne({ _id: data.id});
            const model = vs.collection.conn.model(vs.name, new Schema({}, {strict: false}), vs.source);

            const transformedRecords = dataInput.map( record => transformFieldsToRealTypes( record , vs.fieldsMap))
        

            await model.remove({ _id: { $in: dataInput.map(i => i._id) } });
            await model.insertMany(transformedRecords);

            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false };
        }

        // const that = this;
        // return new Promise<IMutationResponse>((resolve, reject) => {
        //     const dataInput = JSON.parse(data.input);



        //     const fileExtensionIndex = dataInput.inputName.lastIndexOf('.') !== -1 ? dataInput.inputName.lastIndexOf('.') : dataInput.inputName.length;
        //     dataInput.inputName = camelCase(dataInput.inputName.substr(0, fileExtensionIndex)).toLowerCase();

        //     this._virtualSourceSvc.model.getDataSourceByName(dataInput.inputName).then(virtualSource => {
        //         that._dataSourcesSvc.removeVirtualSourceMapCollection(virtualSource.source).then(() => {
        //             dataInput.inputName = virtualSource.source;
        //             dataInput.fields = JSON.parse(dataInput.fields);
        //             dataInput.records = JSON.parse(dataInput.records);

        //             that._dataSourcesSvc.createVirtualSourceMapCollection(dataInput).then(() => {
        //                 resolve({ success: true });
        //                 return;
        //             });
        //         });
        //     }).catch(err => {
        //         resolve(null);
        //     });
        // });
    }
}
