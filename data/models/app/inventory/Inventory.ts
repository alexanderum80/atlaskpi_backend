import { IInventoryModel } from './IInventory';
import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;
let InventorySchema = new Schema({
    location: {
        id: String,
        name: String
    },
    customer: {
        id: String,
        name: String
    },
    employee: {
        id: String,
        name: String
    },
    product: {
        id: String,
        name: String
    },
    quantity: {
        ordered: Number,
        delivered: Number,
        sold: Number
    }
});

export function getInventoryModel(m: mongoose.Connection): IInventoryModel {
    return <IInventoryModel>m.model('Inventory', InventorySchema, 'inventory');
}