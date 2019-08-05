import { DataEntryMutationResponse } from './../data-entry.types';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { DataSourcesService } from '../../../services/data-sources.service';
import { IDataEntryInput } from '../data-entry.types';
import { UpdateVirtualSourceSchemaActivity } from '../activities/update-virtualsource-schema.activity';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { VirtualSources } from '../../../domain/app/virtual-sources/virtual-source.model';

@injectable()
@mutation({
    name: 'updateVirtualSourceSchema',
    activity: UpdateVirtualSourceSchemaActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: IDataEntryInput, required: true },
    ],
    output: { type: DataEntryMutationResponse }
})
export class UpdateVirtualSourceSchemaMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService,
        @inject(VirtualSources.name) private _virtualSourceSvc: VirtualSources,
    ) {
    super();
    }

    async run(data: { id: string, input: IDataEntryInput }): Promise<IMutationResponse> {
        const that = this;
       try {
        const vs = await this._virtualSourceSvc.model.findOne({ _id: data.id});
        const dataInput = data.input;
        const fields = JSON.parse(dataInput.fields);
        const fieldsMapped = await this._dataSourcesSvc.mapFieldsFromFrontend(fields);
        const dateFieldPath = fieldsMapped[dataInput.dateRangeField].path;

        let VirtualSInputObj: {
            description: string ,
            dateField: string,
            fieldsMap: Object,
            users: string[],
        } = {
            description: dataInput.inputName,
            fieldsMap: fieldsMapped,
            dateField: (dateFieldPath) ? dateFieldPath : vs.dateField,
            users: dataInput.users
        };
        const mappedVs = Object.assign(vs, VirtualSInputObj);

        const result = await this._virtualSourceSvc.model.findByIdAndUpdate(data.id, mappedVs);
        if (result) {
         return {success: true, entity: mappedVs};
        }

       }
       catch (e) {
           console.error(e);
           return {success: false};
       }
    }
}
