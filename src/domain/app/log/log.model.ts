import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { ILogEntryModel } from './log';


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
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'LogEntry', LogEntrySchema, 'logs');
    }
}
