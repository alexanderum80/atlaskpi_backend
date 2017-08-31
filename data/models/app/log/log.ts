import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { ILogEntry, ILogEntryDocument, ILogEntryModel } from './ILog';

let Schema = mongoose.Schema;

let LogEntrySchema = new Schema({
    timestamp: Date,
    hostname: String,
    ip: String,
    clientId: String,
    clientDetails: String,
    level: Number,
    message: String,
});

export function getLogModel(m: mongoose.Connection): ILogEntryModel {
    return <ILogEntryModel>m.model('LogEntry', LogEntrySchema, 'logs');
}