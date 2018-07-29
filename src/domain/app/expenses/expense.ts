import * as mongoose from 'mongoose';

import { IIdName } from '../../common/id-name';
import { ICriteriaSearchable } from '../../../app_modules/shared/criteria.plugin';

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

export interface IExpenseModel extends mongoose.Model<IExpenseDocument>, ICriteriaSearchable {
    findByPredefinedDateRange(predefinedDateRange: string): Promise<IExpenseDocument[]>;
    amountByDateRange(fromDate: string, toDate: string): Promise<Object>;
    monthsAvgExpense(date: string): Promise<Object>;
}
