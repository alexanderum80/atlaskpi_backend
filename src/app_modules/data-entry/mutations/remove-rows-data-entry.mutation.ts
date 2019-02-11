import { DataEntryMutationResponse } from '../data-entry.types';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { VirtualSources } from '../../../domain/app/virtual-sources/virtual-source.model';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { Schema } from 'mongoose';
import { RemoveRowsDataEntryCollectionActivity } from '../activities/remove-rows-data-entry-collection.activity';

@injectable()
@mutation({
    name: 'removeRowsDataEntry',
    activity: RemoveRowsDataEntryCollectionActivity,
    parameters: [
        { name: 'VsId', type: String, required: true },
        { name: 'rowsIds', type: String, required: true, isArray: true},
    ],
    output: { type: DataEntryMutationResponse }
})
export class RemoveRowsDataEntryMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(VirtualSources.name) private _virtualSourceSvc: VirtualSources,
    ) {
    super();
    }

    async run(data: { VsId: string, rowsIds: string[] }): Promise<IMutationResponse> {
        try {
            const vs = await this._virtualSourceSvc.model.findOne({ _id: data.VsId});
            const model = vs.collection.conn.model(vs.name, new Schema({}, {strict: false}), vs.source);

            await model.remove({ _id: { $in: data.rowsIds } });

            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false };
        }
    }
}
