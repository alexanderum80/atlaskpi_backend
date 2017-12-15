import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';

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
