import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';
import { IDateRange } from '../../common/date-range';

export interface IEntity {
    externalId: string | number;
    name: string;
}

export interface ISaleLocation {
    identifier: string;
    name: string;
    city: string;
    state: string;
    zip: string;

    type: string;
    size: string;
}

export interface ISaleCustomer extends IEntity {
        city: string;
        state: string;
        zip: string;
        gender: string;
}


export interface ISaleEmployee extends IEntity {
    fullName: string;
    role: string;
    type: string; // full time (f), part time (p)
    workedTime: number; // in seconds
}

export interface ISaleProduct extends IEntity {
    itemCode: string;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    tax2: number;
    amount: number;
    paid: number;
    discount: number;
    from: Date;
    to: Date;
}

export interface ICategory extends IEntity {
    service: number;
}

export interface ISales {
    externalId: string;
    location: ISaleLocation;
    customer: ISaleCustomer;
    employee: ISaleEmployee;
    product: ISaleProduct;
    category: ICategory;

    timestamp: Date;
    concept: string;
    document: {
        type: string, // invoice, bill, charge, etc
        identifier: string
    };

    payment: {
        method: string; // cash, credit, check
        type: string;   // visa, master card
        amount: number;
    };
}

export enum TypeMap {
    customerAndZip = 'customerAndZip',
    productAndZip = 'productAndZip'
}

export interface ISaleByZip {
    _id: string;
    sales: number;
}


export interface ISaleDocument extends ISales, mongoose.Document { }

export interface ISaleModel extends mongoose.Model<ISaleDocument> {
    findByPredefinedDateRange(predefinedDateRange: string): Promise<ISaleDocument[]>;
    amountByDateRange(from: string, to: string): Promise<Object>;
    salesEmployeeByDateRange(predefinedDateRange: string): Promise<Object>;
    monthsAvgSales(date: string): Promise<Object>;
    findCriteria(field: string): Promise<any[]>;
    salesBy(type: TypeMap): Promise<ISaleByZip[]>;
}