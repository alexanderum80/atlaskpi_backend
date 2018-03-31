import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { input } from '../../../framework/decorators/input.decorator';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { tagsPlugin } from '../tags/tag.plugin';
import { IVirtualSourceModel } from '../virtual-sources/virtual-source';
import { DataSourceResponse } from '../../../app_modules/data-sources/data-sources.types';

const Schema = mongoose.Schema;
const VirtualSourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    source: { type: String, required: true },
    dateField: { type: String, required: true },
    aggregate: { type: [mongoose.Schema.Types.Mixed], required: true },
    fieldsMap: { type: mongoose.Schema.Types.Mixed, required: true },
    createdOn: { type: Date, default: Date.now }
});

VirtualSourceSchema.statics.getDataSources = getDataSources;

@injectable()
export class VirtualSources extends ModelBase<IVirtualSourceModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'VirtualSource', VirtualSourceSchema, 'virtualSources');
    }
}


async function getDataSources(): Promise<DataSourceResponse[]> {
    const model = this as IVirtualSourceModel;

    try {
        const virtualSources = await model.find({});
        const dataSources: DataSourceResponse[] = virtualSources.map(ds => {
            const fieldNames = Object.keys(ds.fieldsMap);
            const fields = fieldNames.map(f => ({ name: f, path: ds.fieldsMap[f].path, type: ds.fieldsMap[f].dataType }));
            return {
                name: ds.name.toLocaleLowerCase(),
                dataSource: ds.source,
                fields: fields,
                groupings: fieldNames
            };
        });

        return dataSources;
    } catch (e) {
        console.error('Error getting virtual sources');
        return [];
    }
}
