import { IExpenseModel } from './';
import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

let IdNameSchema = new Schema({
    id: String,
    name: String,
});

let BusinessUnitSchema = new Schema({
    name: String
});

const ExpenseSchema = new Schema({
    source: String,
    externalId: { type: String, unique: true },
    location: IdNameSchema,
    expense: {
        concept: String,
        amount: Number
    },
    timestamp: Date,
    businessUnit: BusinessUnitSchema,
    document: {
        type: String, // invoice, bill, charge, etc
        identifier: String
    }
});

// INDEXS

ExpenseSchema.index({ 'timestamp': 1 });
ExpenseSchema.index({ 'timestamp': 1, 'businessUnit.name': 1 });
ExpenseSchema.index({ 'timestamp': 1, 'expense.concept': 1 });

export function getExpenseModel(m: mongoose.Connection): IExpenseModel {
    return <IExpenseModel>m.model('Expense', ExpenseSchema, 'expenses');
}