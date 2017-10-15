import { ISaleModel } from './ISale';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

let Schema = mongoose.Schema;

let EntitySchema = {
    externalId: String,
    name: String,
};

let LocationSchema = {
    externalId: String,
    identifier: String,
    name: String,
    city: String,
    state: String,
    zip: String,

    type: String,
    size: String
};

let CustomerSchema = {
        externalId: String,
        city: String,
        state: String,
        zip: String,
        gender: String,
};

let EmployeeSchema = {
    externalId: String,
    fullName: String,
    role: String,
    type: String, // full time (f), part time (p)
    workedTime: Number // time in seconds
};

let ProductSchema = {
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
};

let CategorySchema = {
    externalId: String,
    name: String,
    service: Number,
};

let DocumentSchema = {
    type: String,
    indentifier: String,
};

let PaymentSchema = {
    method: String,
    type: String,
    amount: Number
};

let BusinessUnitSchema = {
    name: String
};




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
    businessUnit: new Schema(BusinessUnitSchema),
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

