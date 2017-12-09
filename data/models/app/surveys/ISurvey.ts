import * as mongoose from 'mongoose';

import { IProductDocument } from '../products';
import { ILocationDocument } from '../location';
import { ICustomerDocument } from '../customers';
import { IEmployeeDocument } from '../employees';

export interface ISurvey {
    location: ILocationDocument;
    customer: ICustomerDocument;
    employee: IEmployeeDocument;
    product: IProductDocument;
    rate: number;
}

export interface ISurveyDocument extends mongoose.Document { }

export interface ISurveyModel extends mongoose.Model<ISurveyDocument> { }