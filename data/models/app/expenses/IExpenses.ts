import * as mongoose from 'mongoose';
import { IIdName } from '../../common';
import * as Promise from 'bluebird';

export interface IExpenseLine {
    concept: string;
    amout: number;
}

export interface IExpenseLocation {
    name: string;
}

export interface IExpense {
    source: string;
    externalId: string;
    location: IIdName;
    expense: IExpenseLine;
    timestamp: Date;
    businessUnit: {
        name: string;
    };
    document: {
        type: string; // invoice, bill, charge, etc
        identifier: string
    };
}

export interface IExpenseDocument extends IExpense, mongoose.Document { }

export interface IExpenseModel extends mongoose.Model<IExpenseDocument> {
    findByPredefinedDateRange(predefinedDateRange: string): Promise<IExpenseDocument[]>;
    findCriteria(field: string): Promise<any[]>;
}
