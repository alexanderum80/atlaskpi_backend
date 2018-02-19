import * as mongoose from 'mongoose';
import { IIdName } from '../../common/id-name';

export interface IInventoryProduct {
    externalId: string;
    itemCode: string;
    itemDescription: string;
}

export interface IInventory {
    source: string;
    externalId: string;
    location: IIdName;
    product: IInventoryProduct;
    updatedAt: Date;
    onHand: number;
    onOrder: number;
    cost: number;
}

export interface IInventoryDocument extends mongoose.Document { }

export interface IInventoryModel extends mongoose.Model<IInventoryDocument> {
    findCriteria(field: string, limit?: number, filter?: string): Promise<string[]>;
}