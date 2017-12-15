import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IWorkLogModel } from './work-log';

let Schema = mongoose.Schema;

let WorkLogSchema =  new Schema ({
    externalId: String,
    date: Date,
    workTime: Number
});

@injectable()
export class Worklogs extends ModelBase<IWorkLogModel> {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'WorkLog', WorkLogSchema, 'workLogs');
    }
}
