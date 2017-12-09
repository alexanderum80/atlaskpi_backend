import { parsePredifinedDate } from '../../common';
import { IExpenseDocument, IExpenseModel } from './';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

const Schema = mongoose.Schema;

let IdNameSchema = {
    id: String,
    name: String,
};

let BusinessUnitSchema = {
    name: String
};

export const ExpenseSchema = new Schema({
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

ExpenseSchema.statics.findByPredefinedDateRange = function(predefinedDateRange: string): Promise<IExpenseDocument[]> {
    const ExpenseModel = (<IExpenseModel>this);
    const dateRange = parsePredifinedDate(predefinedDateRange);

    return new Promise<IExpenseDocument[]>((resolve, reject) => {
        ExpenseModel.find({ 'timestamp': { '$gte': dateRange.from, '$lte': dateRange.to } })
        .then(expenses => {
            resolve(expenses);
        })
        .catch(err => {
            logger.error('There was an error retrieving expenses by predefined data range', err);
            reject(err);
        });
    });
};

ExpenseSchema.statics.findCriteria = function(field: string): Promise<IExpenseDocument[]> {
    const that = this;

    return new Promise<IExpenseDocument[]>((resolve, reject) => {
        that.distinct(field).then(expenses => {
            resolve(expenses);
            return;
        }).catch(err => {
            reject(err);
            return;
        });
    });
};


export function getExpenseModel(m: mongoose.Connection): IExpenseModel {
    return <IExpenseModel>m.model('Expense', ExpenseSchema, 'expenses');
}