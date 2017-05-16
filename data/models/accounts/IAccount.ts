import mongoose = require('mongoose');
import * as Promise from 'bluebird';

export interface IPersonalInfo {
    fullname: string;
    email: string;
}

export interface IBusinessInfo {
    numberOfLocations: number;
    country: string;
    phoneNumber: string;
}

export interface IDatabaseInfo {
    url: string;
    name: string;
}

export interface IAudit {
    createdOn: Date;
    updatedOn: Date;
}

export interface IAccount {
    name: string;
    personalInfo: IPersonalInfo;
    businessInfo: IBusinessInfo;
    database: IDatabaseInfo;
    audit: IAudit;
}

// declare interface to mix account and mongo docuemnt properties/methods
export interface IAccountDocument extends IAccount, mongoose.Document {
    getConnectionString(): string;
}

export interface IAccountModel extends mongoose.Model<IAccountDocument> {
    createNewAccount(account: IAccount): Promise<IAccount>;
    findAccountByHostname(hostname: String): Promise<IAccountDocument>;
}
