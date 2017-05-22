"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var idName = {
    id: { type: String },
    externalId: { type: String },
    name: { type: String }
};
var SaleEmployeeSchema = new Schema({
    id: String,
    name: String,
    type: String,
    role: String,
    percent: Number,
    amount: Number
});
var SaleItem = new Schema({
    cost: Number,
    price: Number,
    tax: Number
});
var SalePaymentSchema = new Schema({
    transactionId: String,
    paymentMethod: String,
    amount: Number,
    tax: Number,
    total: Number
});
var SaleCouponSchema = new Schema({
    type: String,
    name: String,
    value: new Schema({
        type: String,
        amount: Number
    }),
    discount: Number
});
var SaleTotalsSchema = new Schema({
    subtotal: Number,
    salesTax: Number,
    discount: Number,
    total: Number
});
var GlobalDiscountSchema = new Schema({
    type: String,
    value: Number,
    discount: Number
});
var RevenueSchema = new Schema({
    externalId: String,
    concept: String,
    code: String,
    type: String,
    timestamp: Date,
    location: {
        id: String,
        name: String
    },
    employee: {
        id: String,
        name: String
    },
    customer: {
        id: String,
        name: String
    },
    employees: [SaleEmployeeSchema],
    items: [SaleItem],
    payments: [SalePaymentSchema],
    coupons: [SaleCouponSchema],
    globalDiscount: GlobalDiscountSchema,
    totals: SaleTotalsSchema
});
// SaleSchema.methods.
// SaleSchema.statics.
function getRevenueModel(m) {
    return m.model('Revenue', RevenueSchema, 'revenues');
}
exports.getRevenueModel = getRevenueModel;
//# sourceMappingURL=Revenue.js.map