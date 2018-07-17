import { criteriaPlugin } from '../../../app_modules/shared/criteria.plugin';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';
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
    externalId: { type: String },
    location: locationSchema,
    product: inventoryProductSchema,
    updatedAt: Date,
    onHand: Number,
    onOrder: Number,
    cost: Number
});

InventorySchema.plugin(criteriaPlugin);

InventorySchema.statics.inventoryOldestDate = function(collectionName: string): Promise<Object> {
    const InventoryModel = (<IInventoryModel>this);

    return new Promise<Object>((resolve, reject) => {
        InventoryModel.aggregate({ '$match': { 'updatedAt': { '$exists': true }}},
                    { '$sort': { 'updatedAt': 1 }},
                    { '$group': { '_id': null, 'oldestDate': { '$first': '$updatedAt' }}})
            .then(result => {
                const searchResult = {
                    name: collectionName,
                    data: result
                };
                resolve(searchResult);
        })
        .catch(err => {
            logger.error('There was an error retrieving inventory oldest Date', err);
            reject(err);
        });
    });
};

@injectable()
export class Inventory extends ModelBase<IInventoryModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Inventory', InventorySchema, 'inventory');
    }
}