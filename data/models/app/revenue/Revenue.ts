import { IRevenueModel } from './IRevenue';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

let Schema = mongoose.Schema;

let idName = {
    id: { type: String },
    externalId: { type: String },
    name: { type: String }
};

let SaleEmployeeSchema = new Schema({
    id: String,
    name: String,
    type: String,
    role: String,
    percent: Number,
    amount: Number,
});

let SaleItem = new Schema({
    cost: Number,
    price: Number,
    tax: Number,
});

let SalePaymentSchema = new Schema({
    transactionId: String,
    paymentMethod: String,
    amount: Number,
    tax: Number,
    total: Number
});

let SaleCouponSchema = new Schema({
    type: String, //  generic clasification for the coupon, not a big deal I think
    name: String,
    value: new Schema({
        type: String,
        amount: Number,
    }),
    discount: Number
});

let SaleTotalsSchema = new Schema({
    subtotal: Number,
    salesTax: Number,
    discount: Number,
    total: Number,
});

let GlobalDiscountSchema = new Schema({
    type: String,
    value: Number,
    discount: Number
});

let RevenueSchema = new Schema({
    externalId: String,
    concept: String, // rent, sale, etc
    code: String,
    type: String, // regular, tax exempt, refund, layaway
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

export const RevSchema = RevenueSchema;

// SaleSchema.methods.

// SaleSchema.statics.

export function getRevenueModel(m: mongoose.Connection): IRevenueModel {
    return <IRevenueModel>m.model('Revenue', RevenueSchema, 'revenues');
}