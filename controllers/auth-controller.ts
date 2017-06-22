import { IUserToken } from '../data/models/common/user-token';
import * as Promise from 'bluebird';
import * as jwt from 'jsonwebtoken';
import * as winston from 'winston';
import { config } from '../config';
import ms = require('ms');
import * as moment from 'moment';
import connectToMongoDb from '../data/mongo-utils';
import {
    IAccountModel,
    IAccountDocument,
    IUserDocument,
    IIdentity,
    IAppModels,
    ITokenDetails } from '../data/models';

export class AuthController {
    status: string = 'intial value';

    constructor(private _Account: IAccountModel, private _appContext: IAppModels) { }

    authenticateUser(hostname: string, username: string, password: string, ip: string, clientId: string, clientDetails: string): Promise<IUserToken> {
        let that = this;

        return new Promise<IUserToken>((resolve, reject) => {
            if (!hostname) {
                throw { status: 400, message: 'Invalid hostname' };
            }

            if (!username || !password) {
                throw { status: 400, message: 'Username or password missing' };
            }

            let account: IAccountDocument;
            let user: IUserDocument;

            this._Account.findAccountByHostname(hostname)
                .then((acct: IAccountDocument) => {
                    winston.debug('token: account found');
                    account = acct;
                    return that._appContext.User.authenticate(username, password);
                })
                .then((u: IUserDocument) => {
                    winston.debug('token: credentials validated');
                    // I need to save the user for later use
                    user = u;
                    return that._generateIdentity(account, user);
                })
                .then((identity: IIdentity) => {
                    winston.debug('token: identity generated');
                    return that._generateToken(identity);
                })
                .then((token: string) => {
                    winston.debug('token: token generated: ' + token);

                    let tokenDetails: ITokenDetails = {
                        issued: new Date(),
                        expires: moment().add('milliseconds', ms(String(config.token.expiresIn))).toDate(),
                        access_token: token
                    };

                    user.addToken(tokenDetails, ip, clientId, clientDetails);

                    resolve(tokenDetails);
                })
                .catch((err) => {
                    winston.error('Error generating user token: ', err);

                    if (err && err.name === 'notfound') {
                        err.status = 404;
                    }

                    reject(err);
                });
        });
    }

    private _generateIdentity(account: IAccountDocument, user: IUserDocument): Promise<IIdentity> {
        return new Promise<IIdentity>((resolve, reject) => {
            let userSignature: IIdentity = {
                username: user.username,
                firstName: user.profile.firstName,
                middleName: user.profile.middleName,
                lastName: user.profile.lastName,
                roles: user.roles.map((role) => role.name),
                dbUri: account.getConnectionString()
            };

            resolve(userSignature);
        });
    }

    private _generateToken(identity: IIdentity): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let token = jwt.sign(identity, config.token.secret, {
                expiresIn: config.token.expiresIn
            });

            resolve(token);
        });
    }
}
