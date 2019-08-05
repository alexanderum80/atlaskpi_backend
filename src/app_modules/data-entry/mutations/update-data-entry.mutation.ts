import { RemoveDataEntryResult } from '../data-entry.types';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
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
    output: { type: RemoveDataEntryResult }
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
            let entity;
            const docsContainIds = dataInput.filter(i => i._id);

            if(docsContainIds && docsContainIds.length ){
                await model.remove({ _id: { $in: dataInput.map(i => i._id) } });
            }

            await model.insertMany(transformedRecords)
            .then(res => {
                entity = res[0];
            });

            return { success: true , entity: JSON.stringify(entity)};
        } catch (e) {
            console.error(e);
            return { success: false };
        }
    }
}
