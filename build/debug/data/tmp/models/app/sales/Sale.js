"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var idName = {
    id: { type: String },
    externalId: { type: String },
    name: { type: String }
};
var saleEmployeeSchema = new Schema({
    percent: Number,
    amount: Number
});
var saleItem = new Schema({
    cost: Number,
    price: Number,
    tax: Number
});
var saleTotals = new Schema({
    subtotal: Number,
    salesTax: Number,
    discount: Number,
    total: Number
});
var SaleSchema = new Schema({
    transactionId: { type: String },
    type: { type: String },
    timestamp: { type: Date },
    location: new Schema(idName),
    employees: [saleEmployeeSchema],
    customer: new Schema(idName),
    item: [saleItem],
    totals: saleTotals
});
// SaleSchema.methods.
// SaleSchema.statics.
function getSaleModel(m) {
    return m.model('Sale', SaleSchema, 'sales');
}
exports.getSaleModel = getSaleModel;
//# sourceMappingURL=Sale.js.map