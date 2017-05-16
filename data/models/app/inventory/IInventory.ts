import * as mongoose from 'mongoose';

import { IProductDocument } from '../products';
import { ILocationDocument } from '../locations';
import { ICustomerDocument } from '../customers';
import { IEmployeeDocument } from '../employees';

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