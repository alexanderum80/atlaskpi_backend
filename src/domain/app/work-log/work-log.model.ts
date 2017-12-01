import { ModelBase } from '../../../type-mongo';
import { AppConnection } from '../app.connection';
import { injectable, inject } from 'inversify';
import { IWorkLogModel } from './work-log';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

let Schema = mongoose.Schema;

let WorkLogSchema =  new Schema ({
    externalId: String,
    date: Date,
    workTime: Number
});

@injectable()
export class Worklogs extends ModelBase<IWorkLogModel> {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super(appConnection, 'WorkLog', WorkLogSchema, 'workLogs');
    }
}
