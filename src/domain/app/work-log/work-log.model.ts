import { IWorkLogModel } from './work-log';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

let Schema = mongoose.Schema;

let WorkLogSchema =  new Schema ({
    externalId: String,
    date: Date,
    workTime: Number
});

export function getWorkLogModel(m: mongoose.Connection): IWorkLogModel {
    return <IWorkLogModel>m.model('WorkLog', WorkLogSchema, 'workLogs');
}
