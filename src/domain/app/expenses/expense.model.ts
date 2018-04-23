import { criteriaPlugin } from '../../../app_modules/shared/criteria.plugin';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';
import * as moment from 'moment';

import { ModelBase } from '../../../type-mongo/model-base';
import { parsePredifinedDate } from '../../common/date-range';
import { AppConnection } from '../app.connection';
import { IExpense, IExpenseDocument, IExpenseModel } from './expense';


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
        type: String,
        concept: String,
        amount: Number
    },
    timestamp: Date,
    businessUnit: BusinessUnitSchema,
    document: {
        type: { type: String }, // invoice, bill, charge, etc
        identifier: String
    }
});


// INDEXS

ExpenseSchema.index({ 'timestamp': 1 });
ExpenseSchema.index({ 'timestamp': 1, 'businessUnit.name': 1 });
ExpenseSchema.index({ 'timestamp': 1, 'expense.concept': 1 });

ExpenseSchema.plugin(criteriaPlugin);

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

ExpenseSchema.statics.amountByDateRange = function(fromDate: string, toDate: string): Promise<Object> {
    const ExpenseModel = (<IExpenseModel>this);

    const from = moment(fromDate).utc().toDate();
    const to = moment(toDate).utc().toDate();

    return new Promise<Object>((resolve, reject) => {
        ExpenseModel.aggregate({ '$match': { 'timestamp': { '$gte': from, '$lt': to } } },
                            { '$group': { '_id': null, 'count': { '$sum': 1 }, 'amount': { '$sum': '$expense.amount' } } })
        .then(expenses => {
            resolve(expenses);
        })
        .catch(err => {
            logger.error('There was an error retrieving expenses by predefined data range', err);
            reject(err);
        });
    });
};

ExpenseSchema.statics.monthsAvgExpense = function(date: string): Promise<Object> {
    const ExpenseModel = (<IExpenseModel>this);

    let _year = moment(date).utc().toDate().getUTCFullYear();
    let _month = moment(date).utc().toDate().getUTCMonth();

    if (_month === 0) {
        _year -= 1;
        _month = 12;
    }

    return new Promise<Object>((resolve, reject) => {
        ExpenseModel.aggregate({ '$group': { '_id': { 'year': { '$year': '$timestamp' }, 'month': { '$month': '$timestamp' } }, 'amount': { '$sum': '$expense.amount' } } },
                        { '$match': { '_id.year': { '$lt': _year } , '_id.month': _month } } ,
                        { '$group': { '_id': '$_id.month', 'amount': { '$avg': '$amount' } } })
        .then(expenses => {
            resolve(expenses);
        })
        .catch(err => {
            logger.error('There was an error retrieving expenses by months of previous years ', err);
            reject(err);
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
