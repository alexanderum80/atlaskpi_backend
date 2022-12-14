import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IProductModel } from './product';


let Schema = mongoose.Schema;

let ProductSchema = new Schema({
    extenalIdentifier: String,
    name: { type: String },
    description: { type: String },
    category: { type: String },
    sku: { type: String },
    barcode: { type: String },
    cost: { type: Number },
    price: { type: Number },
    tax: { type: Number },
    vendor: { type: String },
    unitOfMeasure: { type: String },
    condition: { type: String },
    brand: { type: String },
    height: { type: Number },
    width: { type: Number },
    length: { type: Number },
    make: { type: String },
    mod: { type: String },
    materials: { type: String },
});

// ProductSchema.methods.

// ProductSchema.statics.

export function getProductModel(m: mongoose.Connection): IProductModel {
    return <IProductModel>m.model('Product', ProductSchema, 'products');
}

@injectable()
export class Products extends ModelBase<IProductModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Product', ProductSchema, 'products');
    }
}
