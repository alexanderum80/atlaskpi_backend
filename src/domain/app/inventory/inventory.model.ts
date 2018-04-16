import { criteriaPlugin } from '../../../app_modules/shared/criteria.plugin';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { AppConnection } from '../app.connection';
import { ModelBase } from './../../../type-mongo/model-base';
import { IInventoryModel } from './inventory';

let Schema = mongoose.Schema;

const inventoryProductSchema = {
    externalId: String,
    itemCode: String,
    itemDescription: String
};

const locationSchema = {
    externalId: String,
    name: String
};

export const InventorySchema = new Schema({
    source: String,
    externalId: { type: String, unique: true },
    location: locationSchema,
    product: inventoryProductSchema,
    updatedAt: Date,
    onHand: Number,
    onOrder: Number,
    cost: Number
});

InventorySchema.plugin(criteriaPlugin);

@injectable()
export class Inventory extends ModelBase<IInventoryModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Inventory', InventorySchema, 'inventory');
    }
}