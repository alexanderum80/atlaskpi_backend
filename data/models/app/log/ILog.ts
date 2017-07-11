import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface ILogEntry {
    clientId: string;
    level: number;
    message: string;
    timestamp: Date;
}

export interface ILogEntryDocument extends mongoose.Document { }

export interface ILogEntryModel extends mongoose.Model<ILogEntryDocument> { }
