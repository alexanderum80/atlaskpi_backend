import { ModelBase } from '../../../type-mongo';
import { AppConnection } from '../app.connection';
import { injectable, inject } from 'inversify';
import { IInventoryModel } from './inventory';
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

@injectable()
export class Inventory extends ModelBase<IInventoryModel> {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Inventory', InventorySchema, 'inventory');
    }
}
