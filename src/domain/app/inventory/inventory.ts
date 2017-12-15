import * as mongoose from 'mongoose';

import { ICustomerDocument } from '../customers/customer';
import { IEmployeeDocument } from '../employees/employee';
import { ILocationDocument } from '../location/location';
import { IProductDocument } from '../products/product';


export interface IInventory {
    location: ILocationDocument;
    customer: ICustomerDocument;
    employee: IEmployeeDocument;
    product: IProductDocument;
    tyoe: string; // sent, received
    quantity: number;
}

export interface IInventoryDocument extends mongoose.Document { }

export interface IInventoryModel extends mongoose.Model<IInventoryDocument> { }