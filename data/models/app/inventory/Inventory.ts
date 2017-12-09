import { IdName } from '../../common';
import { IInventoryModel, IInventoryDocument } from './IInventory';
import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

const inventoryProductSchema = {
    externalId: String,
    itemCode: String,
    itemDescription: String
};

export const InventorySchema = new Schema({
    location: IdName,
    product: inventoryProductSchema,
    updatedAt: Date,
    onHand: Number,
    onOrder: Number,
    cost: Number
});

InventorySchema.statics.findCriteria = function(field: string): Promise<string[]> {
    const that = this;

    return new Promise<string[]>((resolve, reject) => {
        that.distinct(field).then(values => {
            resolve(values);
            return;
        }).catch(err => {
            reject(err);
            return;
        });
    });
};

export function getInventoryModel(m: mongoose.Connection): IInventoryModel {
    return <IInventoryModel>m.model('Inventory', InventorySchema, 'inventory');
}