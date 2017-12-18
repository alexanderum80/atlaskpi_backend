import * as Promise from 'bluebird';
import * as changeCase from 'change-case';
import { inject, injectable } from 'inversify';
import * as validate from 'validate.js';

import { Logger } from '../../di';
import { IAppConfig, IMongoDBAtlasCredentials } from '../configuration/config-models';
import { AppConnection } from '../domain/app/app.connection';
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
import { field } from '../framework/decorators/field.decorator';
import { input } from '../framework/decorators/input.decorator';
import { IMutationResponse, MutationResponse } from '../framework/mutations/mutation-response';
import { generateUniqueHash } from '../helpers/security.helpers';
import { IsNullOrWhiteSpace } from '../helpers/string.helpers';
import { AppConnectionPool } from '../middlewares/app-connection-pool';
import { AuthService, IUserAuthenticationData } from './auth.service';
import { EnrollmentNotification } from './notifications/users/enrollment.notification';
import { SeedService } from './seed.service';

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
        @inject('Config') private _config: IAppConfig,
        @inject(AppConnectionPool.name) private _appConnectionPool: AppConnectionPool,
        @inject(Accounts.name) private _accounts: Accounts,
        @inject(EnrollmentNotification.name) private _enrollmentNotification: EnrollmentNotification,
        @inject('AuthService') private _authService: AuthService,
        @inject('Logger') private _logger: Logger) {}

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
            const firstUserInfo = getFirstUserInfo(hash, input.account.personalInfo.email, fullName);
            input.account.database = generateDBObject(that._config.newAccountDbUriFormat, accountDatabaseName, accountDbUser.user, accountDbUser.pwd);

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

                createClusterDbUserIfNeeded(that._config.mongoDBAtlasCredentials, newAccount, accountDbUser)
                    .then(success => createUserDatabase(
                        newAccount,
                        input,
                        firstUserInfo,
                        accountDatabaseName,
                        that._config.newAccountDbUriFormat,
                        that._appConnectionPool,
                        that._enrollmentNotification,
                        that._config.subdomain,
                        that._authService)
                        .then(result => resolve(result))
                    )
                    .catch(err => reject(err));
            });
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

function getFirstUserInfo(hash: string, email: string, fullName: IFullName): ICreateUserDetails {
    let firstUser: ICreateUserDetails = {
        email: email,
        password: hash.substr(hash.length - 10, hash.length)
    };

    if (fullName) {
        firstUser.firstName = fullName[0];
        firstUser.lastName = fullName[1];
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
    };
}


function createClusterDbUserIfNeeded(mongodbCredentials: IMongoDBAtlasCredentials, account: IAccountDocument, dbUser: IClusterUser): Promise < boolean > {
    const that = this;

    return new Promise < boolean > ((resolve, reject) => {
        // Create a db user if it's in production
        if (mongodbCredentials && !IsNullOrWhiteSpace(mongodbCredentials.api_key)) {
            that._logger.info('MongoDBAtlas api_key found, creating MongoDBAtlas user...');
            account.createAccountDbUser(dbUser, mongodbCredentials)
                .then((value) => resolve(value))
                .catch((err) => reject(err));
        } else {
            // Local db... no need to create a db user;
            that._logger.debug('MongoDBAtlas api_key not found, assuming backend is not in prod_mode...');
            resolve(true);
        }
    });
}

function createUserDatabase(
    newAccount: IAccountDocument,
    createAccountInfo: ICreateAccountInfo,
    firstUser: ICreateUserDetails,
    databaseName: string,
    newAccountDbUriFormat: string,
    connectionPool: AppConnectionPool,
    enrollmentNotification: EnrollmentNotification,
    subdomain: string,
    authService: AuthService): Promise<IMutationResponse> {

    const databaseObject = generateDBObject(newAccountDbUriFormat, databaseName, 'atlas', 'yA22wflgDf9dZluW');

    return new Promise<IMutationResponse> ((resolve, reject) => {
        let appConnection;
        let users: Users;
        let roles: Roles;
        let permissions: Permissions;

        // connect to users database
        connectionPool.getConnection(databaseObject.uri)
            .then((appConn) => {
                appConnection = AppConnection.FromMongoDbConnection(appConn);
                users = new Users(appConnection);
                roles = new Roles(appConnection);
                permissions = new Permissions(appConnection);

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
            .catch(err => reject(err));
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
        users.model.createUser(firstUser, enrollmentNotification).then((response) => {
                if (!response) {
                    return reject('Could not create the admin user');
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