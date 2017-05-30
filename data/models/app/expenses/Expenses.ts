import { IExpenseModel } from './';
import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
// let ExpenseSchema = new Schema({
//     location: {
//         id: String,
//         name: String
//     },
//     employee: {
//         id: String,
//         name: String
//     },
//     product: {
//         id: String,
//         name: String
//     },
//     expense: {
//         concept: String,
//         amount: Number
//     }
// });

const ExpenseSchema = new Schema({
    location: {
        name: String
    },
    expense: {
        concept: String,
        amount: Number
    },
    timestamp: Date
});

export function getExpenseModel(m: mongoose.Connection): IExpenseModel {
    return <IExpenseModel>m.model('Expense', ExpenseSchema, 'expenses');
}