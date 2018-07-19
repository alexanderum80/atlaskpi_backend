import * as Promise from 'bluebird';
import * as changeCase from 'change-case';
import * as Handlebars from 'handlebars';
import { inject, injectable } from 'inversify';
import * as validate from 'validate.js';

import { IAppConfig } from '../configuration/config-models';
import { AppConnection } from '../domain/app/app.connection';
import { Logger } from '../domain/app/logger';
import { Permissions } from '../domain/app/security/permissions/permission.model';
import { initRoles } from '../domain/app/security/roles/init-roles';
import { initialRoles } from '../domain/app/security/roles/initial-roles';
import { Roles } from '../domain/app/security/roles/role.model';
import { IUserDocument } from '../domain/app/security/users/user';
import { IUserToken } from '../domain/app/security/users/user-token';
import { Users } from '../domain/app/security/users/user.model';
import { ICreateUserDetails } from '../domain/common/create-user';
import { IAccount, IAccountDocument, IDatabaseInfo } from '../domain/master/accounts/Account';
import { Accounts } from '../domain/master/accounts/account.model';
import { ILeadDocument } from '../domain/master/leads/lead';
import { Leads } from '../domain/master/leads/lead.model';
import { field } from '../framework/decorators/field.decorator';
import { input } from '../framework/decorators/input.decorator';
import { IMutationResponse, MutationResponse } from '../framework/mutations/mutation-response';
import { generateUniqueHash } from '../helpers/security.helpers';
import { AppConnectionPool } from '../middlewares/app-connection-pool';
import { IExtendedRequest } from '../middlewares/extended-request';
import { AuthService, IUserAuthenticationData } from './auth.service';
import { EnrollmentNotification } from './notifications/users/enrollment.notification';
import { LeadReceivedNotification } from './notifications/users/lead-received.notification';
import { SeedService } from './seed/seed.service';

export interface ICreateAccountInfo {
    ip: string;
    clientId: string;
    clientDetails: string;
    account: IAccount;
}

interface IFullName {
    first: string;
    last: string;
}

interface IClusterUser {
    user: string;
    pwd: string;
    roles: [{
        roleName: string,
        databaseName: string
    }];
}

export interface IFirstTokenInfo {
    subdomain: string;
    tokenInfo: IUserToken;
}

const ACCOUNT_CREATION_CONSTRAINTS = {
    name: {
        presence: {
            message: '^cannot be blank'
        }
    },
    personalInfo: {
        presence: {
            message: '^cannot be blank'
        }
    }
};

@injectable()
export class AccountsService {

    constructor(
        @inject('Request') private _req: IExtendedRequest,
        @inject('Config') private _config: IAppConfig,
        @inject(AppConnectionPool.name) private _appConnectionPool: AppConnectionPool,
        @inject(Accounts.name) private _accounts: Accounts,
        @inject(Leads.name) private _leads: Leads,
        @inject(EnrollmentNotification.name) private _enrollmentNotification: EnrollmentNotification,
        @inject(LeadReceivedNotification.name) private _leadReceivedNotification: LeadReceivedNotification,
        // @inject(AuthService.name) private _authService: AuthService,
        @inject(Logger.name) private _logger: Logger) {}

    createAccount(input: ICreateAccountInfo): Promise < IMutationResponse > {
        let that = this;
        return new Promise < IMutationResponse > ((resolve, reject) => {
            const accountDatabaseName = changeCase.paramCase(input.account.name);
            const validationErrors = ( < any > validate)(input.account, ACCOUNT_CREATION_CONSTRAINTS, {
                fullMessages: false
            });
            if (validationErrors) {
                resolve(MutationResponse.fromValidationErrors(validationErrors));
                return;
            }
            const hash = generateUniqueHash();
            const accountDbUser: IClusterUser = getClusterDbUser(hash, accountDatabaseName);
            const fullName: IFullName = getFullName(input.account.personalInfo.fullname);
            const firstUserInfo = getFirstUserInfo(hash, input.account.personalInfo.email, fullName,  input.account.personalInfo.timezone);
            input.account.database = generateDBObject(that._config.newAccountDbUriFormat, accountDatabaseName, accountDbUser.user, accountDbUser.pwd);
            input.account.subdomain = input.account.database.name;
            that._accounts.model.create(input.account, (err, newAccount: IAccountDocument) => {
                if (err) {
                    resolve({
                        errors: [{
                            field: 'account',
                            errors: [err.message]
                        }],
                        entity: null
                    });
                    return;
                }
                createUserDatabase(
                        that._req,
                        that._config,
                        that._accounts,
                        that._logger,
                        newAccount,
                        input,
                        firstUserInfo,
                        accountDatabaseName,
                        that._config.newAccountDbUriFormat,
                        that._appConnectionPool,
                        that._enrollmentNotification,
                        that._config.subdomain)
                    .then(result => {
                        resolve(result);
                    })
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }

    // ************* To go back to Leads Signup Flow rename this function to createAccount ********
    createAccountAuthorizationCodeFlow(input: ICreateAccountInfo): Promise < IMutationResponse > {
        let that = this;

        return new Promise < IMutationResponse > ((resolve, reject) => {

            // if no authorization code has been provide do not create account just email details
            if (!input.account.authorizationCode) {
                // just send email
                this._saveLead(input.account)
                    .then(lead => {
                        this._leadReceivedNotification.notify(lead);
                        resolve({
                            success: true
                        });
                    })
                    .catch(err => reject(err));

            } else {

                that._leads.model.findById(input.account.authorizationCode).then(lead => {
                    if (!lead) {
                        throw new Error('Authorization code not found');
                    }

                    input.account.name = lead.company;
                    input.account.personalInfo.email = lead.email;
                    input.account.personalInfo.fullname = lead.fullName;

                    const accountDatabaseName = changeCase.paramCase(input.account.name);
                    const validationErrors = ( < any > validate)(input.account, ACCOUNT_CREATION_CONSTRAINTS, {
                        fullMessages: false
                    });

                    if (validationErrors) {
                        resolve(MutationResponse.fromValidationErrors(validationErrors));
                        return;
                    }

                    const hash = generateUniqueHash();
                    const accountDbUser: IClusterUser = getClusterDbUser(hash, accountDatabaseName);
                    const fullName: IFullName = getFullName(input.account.personalInfo.fullname);
                    const firstUserInfo = getFirstUserInfo(hash, input.account.personalInfo.email, fullName, input.account.personalInfo.timezone);
                    input.account.database = generateDBObject(that._config.newAccountDbUriFormat, accountDatabaseName, accountDbUser.user, accountDbUser.pwd);
                    input.account.subdomain = input.account.database.name;

                    that._accounts.model.create(input.account, (err, newAccount: IAccountDocument) => {
                        if (err) {
                            resolve({
                                errors: [{
                                    field: 'account',
                                    errors: [err.message]
                                }],
                                entity: null
                            });
                            return;
                        }

                        createUserDatabase(
                                that._req,
                                that._config,
                                that._accounts,
                                that._logger,
                                newAccount,
                                input,
                                firstUserInfo,
                                accountDatabaseName,
                                that._config.newAccountDbUriFormat,
                                that._appConnectionPool,
                                that._enrollmentNotification,
                                that._config.subdomain)
                            .then(result => {
                                resolve(result);

                                that._leads.model.remove({ _id: input.account.authorizationCode });
                            })
                            .catch(err => reject(err));
                    });
                });
            }
        });

    }

    private _saveLead(account: IAccount): Promise < ILeadDocument > {
        const that = this;

        return new Promise < ILeadDocument > ((resolve, reject) => {
            that._leads.model.create({
                    company: account.name,
                    email: account.personalInfo.email,
                    fullName: account.personalInfo.fullname
                })
                .then(res => resolve(res))
                .catch(err => reject(err));
        });


    }
}


function getFullName(rawFullName: string): IFullName {
    if (rawFullName) {
        // fullname i.e. John.Doe
        const fullName = rawFullName.split('.');
        return {
            first: fullName[0],
            last: fullName[1]
        };
    }

    return null;
}

function getFirstUserInfo(hash: string, email: string, fullName: IFullName, timezone: string): ICreateUserDetails {
    let firstUser: ICreateUserDetails = {
        email: email,
        password: hash.substr(hash.length - 10, hash.length),
        timezone: timezone
    };

    if (fullName) {
        firstUser.firstName = fullName.first;
        firstUser.lastName = fullName.last;
    }

    return firstUser;
}

function getClusterDbUser(hash: string, databaseName: string): IClusterUser {
    return {
        user: `adm-${hash.substr(hash.length - 10, hash.length)}`,
        pwd: hash.substr(0, 10),
        roles: [{
                roleName: 'dbAdmin',
                databaseName: databaseName
            },
            {
                roleName: 'readWrite',
                databaseName: databaseName
            }
        ]
    } as any;
}


// function createClusterDbUserIfNeeded(logger: Logger, mongodbCredentials: IMongoDBAtlasCredentials, account: IAccountDocument, dbUser: IClusterUser): Promise < boolean > {
//     const that = this;

//     return new Promise < boolean > ((resolve, reject) => {
//         // Create a db user if it's in production
//         if (mongodbCredentials && !IsNullOrWhiteSpace(mongodbCredentials.api_key)) {
//             logger.info('MongoDBAtlas api_key found, creating MongoDBAtlas user...');
//             account.createAccountDbUser(dbUser, mongodbCredentials)
//                 .then((value) => resolve(value))
//                 .catch((err) => reject(err));
//         } else {
//             // Local db... no need to create a db user;
//             logger.debug('MongoDBAtlas api_key not found, assuming backend is not in prod_mode...');
//             resolve(true);
//         }
//     });
// }

function createUserDatabase(
    req: IExtendedRequest,
    config: IAppConfig,
    accounts: Accounts,
    logger: Logger,
    newAccount: IAccountDocument,
    createAccountInfo: ICreateAccountInfo,
    firstUser: ICreateUserDetails,
    databaseName: string,
    newAccountDbUriFormat: string,
    connectionPool: AppConnectionPool,
    enrollmentNotification: EnrollmentNotification,
    subdomain: string): Promise < IMutationResponse > {

    const databaseObject = generateDBObject(newAccountDbUriFormat, databaseName, 'atlas', 'yA22wflgDf9dZluW');

    return new Promise < IMutationResponse > ((resolve, reject) => {
        let appConnection;
        let users: Users;
        let roles: Roles;
        let permissions: Permissions;
        let authService: AuthService;

        // connect to users database
        connectionPool.getConnection(databaseObject.uri)
            .then((appConn) => {
                appConnection = AppConnection.FromMongoDbConnection(appConn);
                // When creating a new account only at this point I know how to create the app connection so I add it to the
                // request objecgt in case other parts of the system need to use it (ex: accesslog in mutation bus)
                req.appConnection = appConnection.get;

                users = new Users(appConnection);
                roles = new Roles(appConnection);
                permissions = new Permissions(appConnection);
                authService = new AuthService(config, accounts, users, roles, logger);

                return appConn;
            })
            .then((appConn) => initializeRolesForAccount(roles, permissions))
            .then((rolesCreated) => createAdminUser(users, newAccount.database.name, firstUser, enrollmentNotification))
            .then(() => new SeedService(appConnection).seedApp())
            .then(() => generateFirstAccountToken(authService, {
                hostname: `${newAccount.database.name}.${subdomain}`,
                username: firstUser.email,
                password: firstUser.password,
                ip: createAccountInfo.ip,
                clientId: createAccountInfo.clientId,
                clientDetails: createAccountInfo.clientDetails
            }))
            .then(token => {
                newAccount.subdomain = token.subdomain;
                newAccount.initialToken = token.tokenInfo;

                resolve({
                    entity: newAccount
                });
            })
            .catch(err => {
                reject(err);
            });
    });
}

function generateDBObject(newAccountDbUriFormat: string, database: string, username: string, password: string): IDatabaseInfo {
    let uriTemplate = Handlebars.compile(newAccountDbUriFormat);
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

function initializeRolesForAccount(roles: Roles, permissions: Permissions): Promise < boolean > {
    return new Promise < boolean > ((resolve, reject) => {
        roles.model.find({}).then((addedRoles) => {
                initRoles(roles, permissions, initialRoles, addedRoles).then(created => {
                        if (created)
                            resolve(true);
                    })
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

function createAdminUser(users: Users, databaseName: string, firstUser: ICreateUserDetails, enrollmentNotification: EnrollmentNotification): Promise < boolean > {
    return new Promise < boolean > ((resolve, reject) => {
        users.model.createUser(firstUser, enrollmentNotification, {
                host: databaseName
            }).then((response) => {
                if (!response) {
                    return reject('Could not create the admin user');
                }

                if (response.errors) {
                    return reject(new Error(response.errors[0].errors[0]));
                }

                ( < IUserDocument > response.entity).addRole('owner', (err, role) => {
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

function generateFirstAccountToken(authService: AuthService, authData: IUserAuthenticationData): Promise < IFirstTokenInfo > {
    return new Promise < IFirstTokenInfo > ((resolve, reject) => {
        // TODO: I need to make sure username and password values are getting in here correctly
        authService.authenticateUser({
                hostname: authData.hostname,
                username: authData.username,
                password: authData.password,
                ip: authData.ip,
                clientId: authData.clientId,
                clientDetails: authData.clientDetails
            }).then((tokenInfo) => {
                resolve({
                    subdomain: authData.hostname,
                    tokenInfo: tokenInfo
                });
            })
            .catch(err => reject(err));
    });
}