"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var EntitySchema = new Schema({
    externalId: String,
    name: String
});
var LocationSchema = new Schema({
    externalId: String,
    identifier: String,
    name: String,
    city: String,
    state: String,
    zip: String,
    type: String,
    size: String
});
var CustomerSchema = new Schema({
    externalId: String,
    city: String,
    state: String,
    zip: String,
    gender: String
});
var EmployeeSchema = new Schema({
    externalId: String,
    name: String,
    firstName: String,
    middleName: String,
    lastName: String,
    role: String,
    type: String,
    workedTime: Number // time in seconds
});
var ProductSchema = new Schema({
    externalId: String,
    name: String,
    cost: Number,
    price: Number,
    tax: Number,
    tax2: Number,
    from: Date,
    to: Date,
    type: String
});
var CategorySchema = new Schema({
    externalId: String,
    name: String,
    service: Boolean
});
var DocumentSchema = new Schema({
    type: String,
    indentifier: String
});
var PaymentSchema = new Schema({
    method: String,
    type: String,
    amount: Number
});
var SalesSchema = new Schema({
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
function getSaleModel(m) {
    return m.model('Sale', SalesSchema, 'sales');
}
exports.getSaleModel = getSaleModel;
//# sourceMappingURL=Sale.js.map