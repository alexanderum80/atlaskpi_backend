import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface ILogEntry {
    timestamp: Date;
    ip: string;
    hostname: string;
    clientId: string;
    clientDetails: string;
    level: number;
    message: string;
}

export interface ILogEntryDocument extends mongoose.Document { }

export interface ILogEntryModel extends mongoose.Model<ILogEntryDocument> { }
