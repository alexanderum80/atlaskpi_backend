import * as mongoose from 'mongoose';
import { IIdName } from '../../common';

export interface IExpenseDetails {
    concept: number;
    amount: number;
}

export interface IExpense {
    location: IIdName;
    employee: IIdName;
    product: IIdName;
    expense: IExpenseDetails;
}

export interface IExpenseDocument extends mongoose.Document { }

export interface IExpenseModel extends mongoose.Model<IExpenseDocument> { }
