import * as Promise from 'bluebird';
import mongoose = require('mongoose');

import { IMongoDBAtlasCredentials } from '../../../configuration/config-models';
import { IBusinessUnit } from '../../app/business-unit/business-unit';
import { IUserToken } from '../../app/security/users/user-token';


export interface IParticularDBUserRole {
    databaseName: string;
    roleName: string;
}

export interface IAccountDBUser {
    user: string;
    pwd: string;
    roles: IParticularDBUserRole[];
}

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
    username: string;
    password: string;
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
    getMasterConnectionString(masterDbUriFormat: string): string;
    createAccountDbUser(particularUser: IAccountDBUser, atlasCredentials: IMongoDBAtlasCredentials): Promise<boolean>;
}

export interface IAccountModel extends mongoose.Model<IAccountDocument> {
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
