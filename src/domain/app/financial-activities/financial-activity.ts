import * as mongoose from 'mongoose';

interface IEntity {
    externalId: string | number;
    name: string;
}

export interface IFinancialActivityLocation extends IEntity {
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
}

export interface IFinancialActivityCustomer extends IEntity {
        city: string;
        state: string;
        zip: string;
        gender: string;
        dob: Date;
        address: string;
        fullname: string;
}


export interface IFinancialActivity extends IEntity {
    location: IFinancialActivityLocation;
    customer: IFinancialActivityCustomer;
    provider: IEntity;
    category: IEntity;
    service: IEntity;

    inputDate: Date;
    billDate: Date;
    serviceDate: Date;
    type: String;

    adjustment: Number;
    appPrepay: Number;
    appToPrepay: Number;
    bill: Number;
    cash: Number;
    charge: Number;
    check: Number;
    credit: Number;
    gcSold: Number;
    gcRedeemed: Number;
    prePayment: Number;
    netPayments: Number;
    refundCash: Number;
    refundCheck: Number;
    refundCredit: Number;
    refundGC: Number;
    totalPayments: Number;
    totalRefunds: Number;
}

export interface IFinancialActivityDocument extends IFinancialActivity, mongoose.Document { }

export interface IFinancialActivityModel extends mongoose.Model<IFinancialActivityDocument> { }
