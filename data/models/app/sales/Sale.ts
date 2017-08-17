import { ISaleModel } from './ISale';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

let Schema = mongoose.Schema;

let EntitySchema = new Schema({
    externalId: String,
    name: String,
});

let LocationSchema =  new Schema ({
    externalId: String,
    identifier: String,
    name: String,
    city: String,
    state: String,
    zip: String,

    type: String,
    size: String
});

let CustomerSchema = new Schema ({
        externalId: String,
        city: String,
        state: String,
        zip: String,
        gender: String,
});

let EmployeeSchema = new Schema({
    externalId: String,
    fullName: String,
    role: String,
    type: String, // full time (f), part time (p)
    workedTime: Number // time in seconds
});

let ProductSchema = new Schema({
    externalId: String,
    itemCode: String,
    itemDescription: String,
    quantity: Number,
    unitPrice: Number,
    tax: Number,
    tax2: Number,
    amount: Number,
    paid: Number,
    discount: Number,
    from: Date,
    to: Date,
    type: String
});

let CategorySchema = new Schema ({
    externalId: String,
    name: String,
    service: Number,
});

let DocumentSchema = new Schema ({
    type: String,
    indentifier: String,
});

let PaymentSchema = new Schema ({
    method: String,
    type: String,
    amount: Number
});

let BusinessUnitSchema = new Schema({
    name: String
});

let SalesSchema = new Schema ({
    source: String,
    externalId: { type: String, unique: true },
    location: LocationSchema,
    customer: CustomerSchema,
    employee: EmployeeSchema,
    product: ProductSchema,
    category: CategorySchema,

    timestamp: Date,
    concept: String,
    document: DocumentSchema,
    payment: PaymentSchema,
    businessUnit: BusinessUnitSchema,
    serviceType: String
});

export const SaleSchema = SalesSchema;

// INDEXES

SaleSchema.index({ 'product.from': 1 });
SaleSchema.index({ 'product.from': 1, 'location.name': 1 });
SaleSchema.index({ 'product.from': 1, 'businessUnit.name': 1 });
SaleSchema.index({ 'product.from': 1, 'serviceType': 1 });
SaleSchema.index({ 'product.from': 1, 'employee.type': 1, 'location.name': 1 });
SaleSchema.index({ 'product.from': 1, 'product.itemDescription': 1 });
SaleSchema.index({ 'product.from': 1, 'category.name': 1 });
SaleSchema.index({ 'product.from': 1, 'category.service': 1 });

// SaleSchema.methods.

// SaleSchema.statics.

export function getSaleModel(m: mongoose.Connection): ISaleModel {
    return <ISaleModel>m.model('Sale', SalesSchema, 'sales');
}

