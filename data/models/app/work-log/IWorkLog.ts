import { IIdName } from '../../common';
import * as mongoose from 'mongoose';

export interface IWorkLog {
    date: Date;
    externalId: number;
    workTime: number;
}


export interface IWorkLogDocument extends IWorkLog, mongoose.Document { }

export interface IWorkLogModel extends mongoose.Model<IWorkLogDocument> { }