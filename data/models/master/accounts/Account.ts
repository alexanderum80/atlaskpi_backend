import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import { IAccountModel, IAccountDocument, IAccount, IDatabaseInfo } from './IAccount';
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

import { seedApp } from '../../../seed/app/seed-app';

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
        url: String,
        name: String,
    },
    audit: {
        createdOn: { type: Date, default: Date.now },
        updatedOn: { type: Date, default: Date.now },
    },
});

// static methods
accountSchema.statics.createNewAccount = function(account: IAccount): Promise<IMutationResponse>   {
    let that = this;
    return new Promise<IMutationResponse>((resolve, reject) => {

        let constrains = {
            name: { presence: { message: '^cannot be blank'}},
            personalInfo: { presence: { message: '^cannot be blank' }},
            businessUnits: { presence: { message: '^cannot be blank' }},
        };

        let validationErrors = (<any>validate)(account, constrains, { fullMessages: false});

        if (validationErrors) {
            resolve(MutationResponse.fromValidationErrors(validationErrors));
            return;
        };

        account.database = generateDBObject(account.name);

        that.create(account, (err, newAccount: IAccount) => {
            if (err) {
                resolve({ errors: [ {field: 'account', errors: [err.message] } ], entity: null });
                return;
            }

            let hash = generateUniqueHash();
            let firstUser: ICreateUserDetails = { email: account.personalInfo.email,
                                                  password: hash.substr(hash.length - 10, hash.length) };

            getContext(`${newAccount.database.url}/${newAccount.database.name}`).then((newAccountContext) => {
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
                            seedApp(newAccountContext);
                        }
                        return Promise.resolve();
                    })
                    .then(() => {
                        let subdomain = `${account.database.name}.kpibi.com:4200`;

                        let auth = new AuthController(that, newAccountContext);
                        auth.authenticateUser(subdomain, firstUser.email, firstUser.password)
                        .then((tokenInfo) => {
                            newAccount.subdomain = subdomain;
                            newAccount.initialToken = tokenInfo;
                            resolve({ entity: newAccount });
                        });
                    });
                    }, (err) => {
                        winston.error('Error creating user: ', err);
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
    return `${this.database.url}/${this.database.name}`;
};

export function getAccountModel(): IAccountModel {
    return <IAccountModel>mongoose.model('Account', accountSchema);
}

export function generateDBObject(databaseName: string): IDatabaseInfo {
    return { url: 'mongodb://localhost',
             name: changeCase.paramCase(databaseName)
           };
};