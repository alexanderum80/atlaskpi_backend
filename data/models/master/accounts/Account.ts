import { IsNullOrWhiteSpace } from '../../../extentions';
import { ITokenInfo } from '../../app/users/IUser';
import { IAppModels } from '../../app/app-models';
import { stringify } from 'querystring';
import { importSpreadSheet } from '../../../google-spreadsheet/google-spreadsheet';
import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import { IAccountModel, IAccountDocument, IAccount, IDatabaseInfo, IAccountDBUser } from './IAccount';
import { IMutationResponse, MutationResponse } from '../..';
import { getContext, ICreateUserDetails, IUserDocument } from '../../../models';
import { AccountCreatedNotification, EnrollmentNotification } from '../../../../services/notifications/users';
import { config } from '../../../../config';
import * as validate from 'validate.js';
import * as winston from 'winston';
import { initRoles } from '../../../../lib/rbac';
import * as rolesSetup from './initialRoles';
import * as changeCase from 'change-case';
import { generateUniqueHash } from '../../../../lib/utils';
import { AuthController } from '../../../../controllers';
import { IUserToken } from '../../common';
import * as Handlebars from 'handlebars';
import * as mongodb from 'mongodb';

import { seedApp } from '../../../seed/app/seed-app';

import * as request from 'request';

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

// static methods
accountSchema.statics.createNewAccount = function(ip: string, clientId: string, clientDetails: string, account: IAccount): Promise<IMutationResponse>   {
    let that = this;

    return new Promise<IMutationResponse>((resolve, reject) => {

        let accountDatabaseName = changeCase.paramCase(account.name);

        let constrains = {
            name: { presence: { message: '^cannot be blank'}},
            personalInfo: { presence: { message: '^cannot be blank' }},
        };

        let validationErrors = (<any>validate)(account, constrains, { fullMessages: false});

        if (validationErrors) {
            resolve(MutationResponse.fromValidationErrors(validationErrors));
            return;
        }

        let hash = generateUniqueHash();

        let accountDbUser = {
            user: `adm-${hash.substr(hash.length - 10, hash.length)}`,
            pwd: hash.substr(0, 10),
            roles: [
                { roleName: 'dbAdmin', databaseName: accountDatabaseName },
                { roleName: 'readWrite', databaseName: accountDatabaseName }
            ]
        };

        account.database = generateDBObject(accountDatabaseName, accountDbUser.user, accountDbUser.pwd);
        let fullName;
        if (account.personalInfo.fullname) {
            // fullname i.e. John.Doe
            fullName = account.personalInfo.fullname.split('.');
            account.personalInfo.fullname = account.personalInfo.fullname.split('.').join(' ');
        }

        let firstUser: ICreateUserDetails = { email: account.personalInfo.email,
                                                password: hash.substr(hash.length - 10, hash.length)};
        if (fullName) {
            firstUser.firstName = fullName[0];
            firstUser.lastName = fullName[1];
        }

        that.create(account, (err, newAccount: IAccountDocument) => {
            if (err) {
                resolve({ errors: [ {field: 'account', errors: [err.message] } ], entity: null });
                return;
            }

            createDbUserIfNeeded(newAccount, accountDbUser).then(success => {
                let databaseObject = generateDBObject(accountDatabaseName, 'atlas', 'yA22wflgDf9dZluW');

                getContext(databaseObject.uri).then((newAccountContext) => {
                    initializeRolesForAccount(newAccountContext)
                        .then((rolesCreated) => {
                            return createAdminUser(newAccountContext, newAccount.database.name, firstUser);
                        })
                        .then(() => {
                            return seedApp(newAccountContext);
                        })
                        .then(() => {
                            // if (account.seedData) {
                            return importSpreadSheet(newAccountContext);
                            // } else {
                                // return Promise.resolve(true);
                            // }
                        })
                        .then(() => {
                            return generateFirstAccountToken(that, newAccountContext, account, firstUser, ip, clientId, clientDetails).then(token => {
                                newAccount.subdomain = token.subdomain;
                                newAccount.initialToken = token.tokenInfo;

                                resolve({ entity: newAccount });
                            });
                        })
                        .catch(err => reject(err));
                    })
                    .catch((err) => {
                        resolve({ errors: [ {field: 'account', errors: [err.message] } ], entity: null });
                    });
            });
        });

    });
};

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

        // let hostnameTokens = hostname.split('.');

        // // make sure the hotsname is in this format: subdomain.domain.com
        // if (hostnameTokens.length !== 3) {
        //     reject('Invalid hostname');
        // }

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

accountSchema.methods.getMasterConnectionString = function() {
    let uriTemplate = Handlebars.compile(config.masterDb);
    return uriTemplate({database: this.database.name});
};

accountSchema.methods.createAccountDbUser = function(accountDbUser: IAccountDBUser): Promise<boolean> {
    winston.info('Creating db specific user: ' + JSON.stringify(accountDbUser));
    let body = {
        databaseName: 'admin',
        roles: accountDbUser.roles,
        username: accountDbUser.user,
        password: accountDbUser.pwd
    };

    let options: request.Options = {
        uri: config.mongoDBAtlasCredentials.uri,
        auth: {
            user: config.mongoDBAtlasCredentials.username,
            pass: config.mongoDBAtlasCredentials.api_key,
            sendImmediately: false
        },
        json: body
    };

    return new Promise<boolean>((resolve, reject) => {
        request.post(options, function(error, response, body) {
            if (!error) {
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

export function getAccountModel(): IAccountModel {
    return <IAccountModel>mongoose.model('Account', accountSchema);
}

function generateDBObject(database: string, username?: string, password?: string): IDatabaseInfo {
    let uriTemplate = Handlebars.compile(config.newAccountDbUriFormat);
    let data = {
        username: username,
        password: password,
        database: database
    };
    return {
        uri: uriTemplate(data),
        name: changeCase.paramCase(database),
        username: username,
        password: password
    };
}

function createDbUserIfNeeded(account: IAccountDocument, dbUser): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        // Create a db user if it's in production
        if (config.mongoDBAtlasCredentials && !IsNullOrWhiteSpace(config.mongoDBAtlasCredentials.api_key)) {
            winston.debug('MongoDBAtlas api_key found, creating MongoDBAtlas user...');
            account.createAccountDbUser(dbUser)
                .then((value) => resolve(value))
                .catch((err) => reject(err));
        } else {
            // Local db... no need to create a db user;
            winston.debug('MongoDBAtlas api_key not found, assuming backend is not in prod_mode...');
            resolve(true);
        }
    });
}

function initializeRolesForAccount(accountContext: IAppModels): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        accountContext.Role.find({}).then((roles) => {
            initRoles(accountContext, rolesSetup.initialRoles, roles).then(created => {
                if (created)
                    resolve(true);
            })
            .catch(err => {
                reject(err);
            });
        })
        .catch(err => {
            reject(err);
        });
    });
}

function createAdminUser(accountContext: IAppModels, databaseName: string, firstUser: ICreateUserDetails): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let notifier = new EnrollmentNotification(config, { hostname: databaseName });
        accountContext.User.createUser(firstUser, notifier).then((response) => {
            (<IUserDocument>response.entity).addRole('admin', (err, role) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
        .catch(err => reject(err));
    });
}

export interface IFirstTokenInfo {
    subdomain: string;
    tokenInfo: IUserToken;
}

function generateFirstAccountToken(codeContext, acountContext: IAppModels, account, firstUser: ICreateUserDetails,
    ip: string, clientId: string, clientDetails: string): Promise<IFirstTokenInfo> {
    const subdomain = `${account.database.name}.${config.subdomain}`;
    const auth = new AuthController(codeContext, acountContext);

    return new Promise<IFirstTokenInfo>((resolve, reject) => {
        // TODO: I need to add the browser details on this request
        auth.authenticateUser(subdomain, firstUser.email, firstUser.password, ip, clientId, clientDetails)
        .then((tokenInfo) => {
            resolve({
                subdomain: subdomain,
                tokenInfo: tokenInfo
            });
        })
        .catch(err => reject(err));
    });
}


