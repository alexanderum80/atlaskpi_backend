import * as mongoose from 'mongoose';
import { IIdName } from '../../common/id-name';
import { ICriteriaSearchable } from '../../../app_modules/shared/criteria.plugin';

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

export interface IInventoryModel extends mongoose.Model<IInventoryDocument>, ICriteriaSearchable {
    inventoryOldestDate(collectionName: string): Promise<Object>;
}