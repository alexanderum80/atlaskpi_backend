import { IWorkLogModel } from './IWorkLog';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

let Schema = mongoose.Schema;

let WorkLogSchema =  new Schema ({
    externalId: Number,
    date: Date,
    workTime: Number
});

export function getWorkLogModel(m: mongoose.Connection): IWorkLogModel {
    return <IWorkLogModel>m.model('WorkLog', WorkLogSchema, 'workLogs');
}
