import * as mongoose from 'mongoose';

import { ICustomerDocument } from '../customers/customer';
import { IEmployeeDocument } from '../employees/employee';
import { IProductDocument } from '../products/product';


// import { ILocationDocument } from '../common/location';
export interface ISurvey {
    // location: ILocationDocument;
    customer: ICustomerDocument;
    employee: IEmployeeDocument;
    product: IProductDocument;
    rate: number;
}

export interface ISurveyDocument extends mongoose.Document { }

export interface ISurveyModel extends mongoose.Model<ISurveyDocument> { }