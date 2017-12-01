import { IIdName } from '../../common';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface ISaleItem extends IIdName {
    type: string; // service, item
    name: string;
    cost: number;
    price: number;
    tax: number;
};

export interface ISaleEmployee extends IIdName {
    id: string;
    name: string;
    type: string; // f, p
    role: string; // Physician, Non Physician, Administrative, etc
    percent: number;
    amount: number;
};

export interface IPayment {
    transactionId: string;
    paymentMethod: string;
    amount: number;
    tax: number;
    total: number;
}

export interface ISaleTotals {
    subtotal: number;
    salesTax: number;
    discount: number;
    total: number;
}

export interface ISaleCoupon {
    type: string; //  generic clasification for the coupon, not a big deal I think
    name: string;
    value: {
        type: string;
        amount: number;
    };
    discount: number;
}

export interface IGlobalDiscount {
    type: string;
    value: number;
    discount: number;
}

export interface IRevenue {
    externalId: string;
    concept: string;
    code: string;
    type: string; // regular, tax exempt, refund, layaway
    timestamp: Date;
    location: IIdName;
    customer: IIdName;
    employees: ISaleEmployee[];
    items: ISaleItem[];
    payments: IPayment[];
    coupons: ISaleCoupon[];
    globalDiscount: IGlobalDiscount;
    totals: ISaleTotals;
}

export interface IRevenueDocument extends IRevenue, mongoose.Document { }

export interface IRevenueModel extends mongoose.Model<IRevenueDocument> { }