import { importSpreadSheet } from '../../../google-spreadsheet/google-spreadsheet';
import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import { IAccountModel, IAccountDocument, IAccount, IDatabaseInfo, IParticularDBUser } from './IAccount';
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

        let particularUser = {
            user: `adm-${hash.substr(hash.length - 10, hash.length)}`,
            pwd: hash.substr(0, 10),
            roles: [
                { roleName: 'dbAdmin', databaseName: accountDatabaseName },
                { roleName: 'readWrite', databaseName: accountDatabaseName }
            ]
        };

        account.database = generateDBObject(accountDatabaseName, particularUser.user, particularUser.pwd);

        let firstUser: ICreateUserDetails = { email: account.personalInfo.email,
                                                password: hash.substr(hash.length - 10, hash.length) };

        that.create(account, (err, newAccount: IAccountDocument) => {
            if (err) {
                resolve({ errors: [ {field: 'account', errors: [err.message] } ], entity: null });
                return;
            }
            getContext(newAccount.getMasterConnectionString()).then((newAccountContext) => {
               return new Promise<boolean>((resolve, reject) => {
                    // Create a db user if it's in production
                    if (config.isMongoDBAtlas) {
                        newAccount.createParticularUser(particularUser)
                        .then((value) => resolve(value))
                        .catch((err) => reject(err));
                    }
                    // Local db... no need to create a db user;
                    resolve(true);
                })
                .then((result) => {
                    if (result !== true) { throw result; }
                    newAccountContext.Role.find({}).then((roles) => {
                        initRoles(newAccountContext, rolesSetup.initialRoles, function (err, admin, readonly) {
                            console.log(admin);
                            console.log(readonly);
                        });
                    })
                 .then((rolesCreated) => {
                    let notifier = new EnrollmentNotification(config, { hostname: newAccount.database.name });
                    newAccountContext.User.createUser(firstUser, notifier).then((response) => {
                        (<IUserDocument>response.entity).addRole('admin');
                        Promise.map(account.businessUnits, (businessUnit) => {
                            return newAccountContext.BusinessUnit.create(businessUnit);
                    })
                    .then(() => {
                        if (account.seedData) {
                           seedApp(newAccount.getMasterConnectionString());
                           return importSpreadSheet(newAccount.getMasterConnectionString());
                        }
                    })
                    .then(() => {
                        let subdomain = `${account.database.name}.${config.subdomain}`;

                        let auth = new AuthController(that, newAccountContext);
                        // TODO: I need to add the browser details on this request
                        auth.authenticateUser(subdomain, firstUser.email, firstUser.password, ip, clientId, clientDetails)
                        .then((tokenInfo) => {
                            newAccount.subdomain = subdomain;
                            newAccount.initialToken = tokenInfo;
                            resolve({ entity: newAccount });
                        });
                    });
                    }, (err) => {
                        winston.error('Error creating user: ', err);
                    });
                 });
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
        };

        that.findOne({ 'database.name': name }, (err, account) => {
            if (err) {
                reject(err);
                return;
            }

            if (account) {
                resolve(account);
            } else {
                throw { code: 404, message: 'Account not found' };
            }
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
    let uriTemplate = Handlebars.compile(config.masterConnectionString);
    return uriTemplate({database: this.database.name});
};

accountSchema.methods.createParticularUser = function(particularUser: IParticularDBUser): Promise<boolean> {
    console.log('Creating db specific user');
    let body = {
        databaseName: 'admin',
        roles: particularUser.roles,
        username: particularUser.user,
        password: particularUser.pwd
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

export function generateDBObject(database: string, user?: string, password?: string): IDatabaseInfo {
    let uriTemplate = Handlebars.compile(config.connectionString);
    let data = {
        user: user,
        password: password,
        database: database
    };
    return { uri: uriTemplate(data), name: changeCase.paramCase(database) };
}
