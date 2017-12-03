import { IMongoDBAtlasCredentials } from '../../../configuration/config-models';
import { MasterConnection } from '../master.connection';
import { Container, injectable, inject } from 'inversify';import mongoose = require('mongoose');
import { ModelBase } from '../../../type-mongo';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';
import * as winston from 'winston';
import * as request from 'request';
import * as changeCase from 'change-case';
import * as Handlebars from 'handlebars';
import { IsNullOrWhiteSpace, generateUniqueHash } from '../../../helpers';
import { IAccountModel, IAccountDocument, IAccount, IDatabaseInfo, IAccountDBUser } from './account';
import { AppConnectionPool } from '../../../middlewares/app-connection-pool';
import { IMutationResponse, MutationResponse } from '../../../framework';
import { ICreateUserDetails } from '../../common';
import { AccountsService } from '../../../services';


// define mongo schema
let accountSchema = new mongoose.Schema({
    name: { type: String, index: true, required: true },
    personalInfo: {
        fullname: String,
        email: { type: String, index: true, required: true },
    },
    businessInfo: {
        numberOfLocations: Number,
        country: String,
        phoneNumber: String,
    },
    database: {
        uri: String,
        name: String,
        username: String,
        password: String
    },
    audit: {
        createdOn: { type: Date, default: Date.now },
        updatedOn: { type: Date, default: Date.now },
    },
});

accountSchema.statics.findAccountByUsername = function(username: string): Promise<IAccountDocument> {
    const that = this;

    return new Promise<IAccountDocument>((resolve, reject) => {
         that.find({ 'profileInfo.email': username }).sort('-_id').limit(1).exec((err, account) => {
            if (account) {
                resolve(account);
            } else {
                throw { code: 404, message: 'Account not found' };
            }
        });
    });
};

accountSchema.statics.findAccountByHostname = function(hostname: string): Promise<IAccountDocument> {
    let that = this;

    return new Promise<IAccountDocument>((resolve, reject) => {

        let name = '';

        if (hostname.indexOf('.') >= 0) {
            name = hostname.split('.')[0];
        } else {
            name = <any>hostname;
        }

        that.findOne({ 'database.name': name }, (err, account) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(account);
        });
    });

};

accountSchema.statics.accountNameAvailable = function(name: String): Promise<boolean> {
    const that = this;

    return new Promise<boolean>((resolve, reject) => {

        that.findOne({ 'name': { $regex: name, $options: 'i' } }, (err, account) => {
            if (err) {
                reject(err);
                return;
            }

            if (account) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};

accountSchema.methods.getConnectionString = function() {
    return this.database.toObject().uri;
};

accountSchema.methods.getMasterConnectionString = function(masterDbUriFormat: string) {
    let uriTemplate = Handlebars.compile(masterDbUriFormat);
    return uriTemplate({ database: this.database.name });
};

accountSchema.methods.createAccountDbUser = function(accountDbUser: IAccountDBUser, atlasCredentials: IMongoDBAtlasCredentials): Promise<boolean> {
    winston.info('Creating db specific user: ' + JSON.stringify(accountDbUser));
    let body = {
        databaseName: 'admin',
        roles: accountDbUser.roles,
        username: accountDbUser.user,
        password: accountDbUser.pwd
    };

    let options: request.Options = {
        uri: atlasCredentials.uri,
        auth: {
            user: atlasCredentials.username,
            pass: atlasCredentials.api_key,
            sendImmediately: false
        },
        json: body
    };

    return new Promise<boolean>((resolve, reject) => {
        request.post(options, function(error, response, body) {
            if (!error || body.error) {
                // winston.error('There was an error creating the database account', error || body.error);
                console.log('User created...');
                resolve(true);
            } else {
                // console.log('Code : ' + response.statusCode);
                // console.log('error : ' + error);
                // console.log('body : ' + body);
                console.log('Error creating db user: ' + error);
                reject(false);
            }
        });
    });

};

@injectable()
export class Accounts extends ModelBase<IAccountModel> {
    constructor(@inject('MasterConnection') appConnection: MasterConnection) {
        super(appConnection, 'Account', accountSchema, 'accounts');
    }
}