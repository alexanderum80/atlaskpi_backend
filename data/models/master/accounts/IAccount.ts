import { IBusinessUnit } from '../../app/business-units/IBusinessUnit';
import { IMutationResponse, IUserToken } from '../../common';
import { IIndustry, ISubIndustry } from '../industries';
import mongoose = require('mongoose');
import * as Promise from 'bluebird';

export interface IParticularDBUserRole {
    databaseName: string;
    roleName: string;
}

export interface IParticularDBUser {
    user: string;
    pwd: string;
    roles: IParticularDBUserRole[];
};

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
    uri: string;
    name: string;
}

export interface IAudit {
    createdOn: Date;
    updatedOn: Date;
}

export interface IAccount {
    name: string;
    personalInfo: IPersonalInfo;
    businessInfo?: IBusinessInfo;
    database?: IDatabaseInfo;
    audit?: IAudit;
    businessUnits?: IBusinessUnit[];
    subdomain: string;
    initialToken?: IUserToken;
    seedData?: boolean;
}

// declare interface to mix account and mongo docuemnt properties/methods
export interface IAccountDocument extends IAccount, mongoose.Document {
    getConnectionString(): string;
    getMasterConnectionString(): string;
    createParticularUser(particularUser: IParticularDBUser): Promise<any>;
}

export interface IAccountModel extends mongoose.Model<IAccountDocument> {
     /**
     * Creates an account.
     * @param {IAccount} account - an object with the details of the account
     * @returns {Promise<IMutationResponse>}
     */
     createNewAccount(account: IAccount): Promise<IMutationResponse>;
     /**
     * Search an account by the hostname
     * @param {String} username - the account owner username
     * @returns {Promise<IAccountDocument>}
     */
     findAccountByUsername(username: string): Promise<IAccountDocument>;
     /**
     * Search an account by the hostname
     * @param {String} hostname - the account hostname
     * @returns {Promise<IAccountDocument>}
     */
     findAccountByHostname(hostname: string): Promise<IAccountDocument>;
     /**
     * Check if an account name is already taken
     * @param {String} name - the account hostname
     * @returns {Promise<Boolean>}
     */
     accountNameAvailable(name: string): Promise<Boolean>;
}
