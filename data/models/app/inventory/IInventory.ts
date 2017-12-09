import { IIdName } from '../../common';
import * as mongoose from 'mongoose';

import { IProductDocument } from '../products';
import { ICustomerDocument } from '../customers';
import { IEmployeeDocument } from '../employees';

export interface IInventoryProduct {
    externalId: string;
    itemCode: string;
    itemDescription: string;
}

export interface IInventory {
    location: IIdName;
    product: IInventoryProduct;
    updatedAt: Date;
    onHand: number;
    onOrder: number;
    cost: number;
}

export interface IInventoryDocument extends mongoose.Document { }

export interface IInventoryModel extends mongoose.Model<IInventoryDocument> { }