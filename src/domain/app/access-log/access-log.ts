import { IQueryResponse } from '../../../framework/queries/index';
import { IMutationResponse } from '../../../framework/mutations/index';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IResultEntry {
    authorized: boolean;
    status: boolean;
    details: string;
}

export interface IAccessLogEntry {
    timestamp: Date;
    accessBy: string;
    ipAddress: string;
    clientDetails: string;
    eventType: string;
    event: string;
    payload: string;
    result: IResultEntry;
}

export interface IAccessLogDocument extends IAccessLogEntry, mongoose.Document {}

export interface IAccessLogModel extends mongoose.Model<IAccessLogDocument> {
    getAllAccessLogs(filter: string): Promise<IAccessLogDocument>;
    createLog(details: IAccessLogEntry): Promise<IMutationResponse>;
}