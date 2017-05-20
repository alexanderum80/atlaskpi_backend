import { ISaleModel } from './ISale';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

let Schema = mongoose.Schema;

let EntitySchema = new Schema({
    externalId: String,
    name: String,
});

let LocationSchema =  new Schema ({
    identifier: String,
    name: String,
    city: String,
    state: String,
    zip: String,

    type: String,
    size: String
});

let CustomerSchema = new Schema ({
        city: String,
        state: String,
        zip: String,
        gender: String,
});

let EmployeeSchema = new Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    role: String,
    type: String, // full time (f), part time (p)
    workedTime: Number // time in seconds
});

let ProductSchema = new Schema({
    cost: Number,
    price: Number,
    tax: Number,
    tax2: Number,
    from: Date,
    to: Date,
});

let CategorySchema = new Schema ({
    service: Boolean,
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

let SalesSchema = new Schema ({
    location: LocationSchema,
    customer: CustomerSchema,
    employee: EmployeeSchema,
    product: ProductSchema,
    category: CategorySchema,

    timestamp: Date,
    concept: String,
    document: DocumentSchema,

    payment: PaymentSchema
});

// SaleSchema.methods.

// SaleSchema.statics.

export function getSaleModel(m: mongoose.Connection): ISaleModel {
    return <ISaleModel>m.model('Sale', SalesSchema, 'sales');
}

