import * as mongoose from 'mongoose';

import { IProductDocument } from '../../../domain/app/products';
import { ILocationDocument } from '../../../domain/app/location';
import { ICustomerDocument } from '../../../domain/app/customers';
import { IEmployeeDocument } from '../../../domain/app/employees';

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