import { DataEntryMutationResponse } from '../data-entry.types';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { DataSourcesService } from '../../../services/data-sources.service';
import { VirtualSources } from '../../../domain/app/virtual-sources/virtual-source.model';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { Schema } from 'mongoose';
import moment = require('moment');
import { UpdateDataFromFileActivity } from '../activities/update-data-from-file.activity';

@injectable()
@mutation({
    name: 'updateDataFromFile',
    activity: UpdateDataFromFileActivity,
    parameters: [
        { name: 'vSId', type: String, required: true },
        { name: 'input', type: String, required: true },
    ],
    output: { type: DataEntryMutationResponse }
})
export class UpdateDataFromFileMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(DataSourcesService.name) private _dataSourceSvc: DataSourcesService,
        @inject(VirtualSources.name) private _virtualSourceSvc: VirtualSources,
    ) {
    super();
    }

    async run(data: { vSId: string, input: string }): Promise<IMutationResponse> {
        try {
            const dataInput = JSON.parse(data.input);
            const vs = await this._virtualSourceSvc.model.findOne({ _id: data.vSId});
            const model = vs.collection.conn.model(vs.name, new Schema({}, {strict: false}), vs.source);

            const dataCollection = <any>dataInput.records;
            const inputFields = dataInput.fields;
            const schemaCollection = vs.fieldsMap;

            const cleanRecords= dataCollection.map(d => {
                                const doc: any = {};
                                for (let i = 0; i < d.length; i++) {
                                    const record = d[i];
                                    const fieldName = inputFields[i].columnName;
                                    const fieldPath = schemaCollection[fieldName].path;
                                    doc[fieldPath] = this._dataSourceSvc.getValueFromDataType(schemaCollection[fieldName].dataType, record);
                                }
                                doc['source'] = 'Manual entry';
                                doc['timestamp'] = moment.utc().toDate();
                                return doc;
                            });
            
            if(dataInput.overRide){
                await model.deleteMany({});
            }
            await model.insertMany(cleanRecords);

            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false };
        }
    }
}
