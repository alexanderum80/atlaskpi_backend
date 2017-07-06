import { IIdName } from '../../common';
import * as mongoose from 'mongoose';

export interface IWorkLog {
    date: Date;
    externalId: number;
    workTime: number;
}

export class WorkLog implements IWorkLog {
    date: Date;
    externalId: number;
    workTime: number;

    constructor(date: Date, id: number, timeInSeconds: number) {
        this.date = date;
        this.externalId = id;
        this.workTime = timeInSeconds;
    }

}

export interface IWorkLogDocument extends IWorkLog, mongoose.Document { }

export interface IWorkLogModel extends mongoose.Model<IWorkLogDocument> { }