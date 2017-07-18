import * as mongoose from 'mongoose';
import { IIdName } from '../../common';

export interface IExpenseLine {
    concept: string;
    amout: number;
    timestamp: Date;
}

export interface IExpenseLocation {
    name: string;
}

export interface IExpense {
    expense:  IExpenseLine;
}

export interface IExpenseDocument extends mongoose.Document { }

export interface IExpenseModel extends mongoose.Model<IExpenseDocument> { }
