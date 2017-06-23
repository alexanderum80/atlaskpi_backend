import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface ILogEntry {
    clientId: string;
    level: number;
    message: string;
}

export interface ILogEntryDocument extends ILogEntry, mongoose.Document {
    clientId: string;
    level: number;
    message: string;
}

export interface ILogEntryModel extends mongoose.Model<ILogEntryDocument> {
    createEntry(details: ILogEntry): Promise<ILogEntryDocument>;
}
