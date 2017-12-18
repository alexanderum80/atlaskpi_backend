import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { parsePredifinedDate } from '../../common/date-range';
import { AppConnection } from '../app.connection';
import { IExpenseDocument, IExpenseModel } from './expense';


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

ExpenseSchema.statics.findCriteria = function(field: string): Promise<any[]> {
    const that = this;

    return new Promise<any[]>((resolve, reject) => {
        that.distinct(field).then(expenses => {
            resolve(expenses);
            return;
        }).catch(err => {
            reject(err);
            return;
        });
    });
};

@injectable()
export class Expenses extends ModelBase<IExpenseModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Expense', ExpenseSchema, 'expenses');
    }
}
