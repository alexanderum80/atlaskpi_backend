import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { ILogEntry, ILogEntryDocument, ILogEntryModel } from './ILog';

let Schema = mongoose.Schema;

let LogEntrySchema = new Schema({
    clientId: String,
    level: Number,
    message: String
});

export function getLogModel(m: mongoose.Connection): ILogEntryModel {
    return <ILogEntryModel>m.model('LogEntry', LogEntrySchema, 'logs');
}

LogEntrySchema.statics.createEntry = function(clientId: string, level: number, message: string): Promise<ILogEntryDocument>   {
    let that = this;
    let newEntry: ILogEntry = { clientId: clientId, level: level, message: message };

    return new Promise<any>((resolve, reject) => {
          that.create(newEntry, (err, doc: ILogEntryDocument) => {
            if (err) {
                reject({ message: 'There was an error creating the log entry', error: err });
                return;
            }

            resolve(doc);
          });
    });
};
