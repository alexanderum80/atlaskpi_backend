import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { tagsPlugin } from '../tags/tag.plugin';
import { IDataSourceModel } from './data-source';

const Schema = mongoose.Schema;

const DataSourceSchema = new Schema({
    name: { type: String, unique: true, required: true },
    dateField: { type: String, required: true },
    fieldsMap: Schema.Types.Mixed,
    aggregates: Schema.Types.Mixed
});


@injectable()
export class DataSources extends ModelBase<IDataSourceModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'DataSource', DataSourceSchema, 'dataSources');
    }
}
