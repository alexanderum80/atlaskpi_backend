import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { input } from '../../../framework/decorators/input.decorator';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { ITagModel } from './tag';

const TagSchema = new mongoose.Schema({
    name: { type: String, unique: true }
});

@injectable()
export class Tags extends ModelBase<ITagModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Tag', TagSchema, 'tags');
    }
}