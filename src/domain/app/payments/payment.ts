import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';
import { IDateRange } from '../../common/date-range';

export interface IEntity {
    externalId: string | number;
    name: string;
}

export interface IPaymentLocation extends IEntity {
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
}

export interface IPaymentCustomer extends IEntity {
        city: string;
        state: string;
        zip: string;
        gender: string;
        dob: Date;
        address: string;
        fullname: string;
}

export interface IPaymentInvoice extends IEntity {
    date: Date;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
}

export interface IPayment {
    source: string;
    externalId: string;
    invoice: IPaymentInvoice;
    location: IPaymentLocation;
    customer: IPaymentCustomer;
    seller: IEntity;
    provider: IEntity;
    coordinator: IEntity;
    paymentType: IEntity;
    paymentMethod: IEntity;
    timestamp: Date;
    percentaje: number;
    amount: number;
    paymentTotalAmount: number;
    description: string;
}

export interface IPaymentDocument extends IPayment, mongoose.Document { }

export interface IPaymentModel extends mongoose.Model<IPaymentDocument> { }
