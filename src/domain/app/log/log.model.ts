import { ModelBase } from '../../../type-mongo';
import { AppConnection } from '../app.connection';
import { injectable, inject } from 'inversify';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import {
    ILogEntry,
    ILogEntryDocument,
    ILogEntryModel
} from './log';

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

@injectable()
export class Logs extends ModelBase<ILogEntryModel> {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'LogEntry', LogEntrySchema, 'logs');
    }
}
