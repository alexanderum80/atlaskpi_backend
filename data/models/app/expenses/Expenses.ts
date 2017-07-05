import { IExpenseModel } from './';
import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

let IdNameSchema = new Schema({
    id: String,
    name: String,
});

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
    source: String,
    externalId: { type: String, unique: true },
    location: IdNameSchema,
    expense: {
        concept: String,
        amount: Number
    },
    timestamp: Date,
    document: {
        type: String, // invoice, bill, charge, etc
        identifier: String
    }
});

export function getExpenseModel(m: mongoose.Connection): IExpenseModel {
    return <IExpenseModel>m.model('Expense', ExpenseSchema, 'expenses');
}