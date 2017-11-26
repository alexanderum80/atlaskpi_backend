import {
    IUserToken
} from '../data/models/common/user-token';
import * as Promise from 'bluebird';
import * as jwt from 'jsonwebtoken';
import * as winston from 'winston';
import {
    config
} from '../config';
import ms = require('ms');
import * as moment from 'moment';
import connectToMongoDb from '../data/mongo-utils';
import {
    IAccountModel,
    IAccountDocument,
    IUserDocument,
    IIdentity,
    IAppModels,
    ITokenDetails
} from '../data/models';

export class AuthController {
    status: string = 'intial value';

    constructor(private _Account: IAccountModel, private _appContext: IAppModels) {}

    authenticateUser(hostname: string, username: string, password: string, ip: string, clientId: string, clientDetails: string): Promise < IUserToken > {
        let that = this;

        return new Promise <IUserToken> ((resolve, reject) => {
            if (!hostname) {
                throw {
                    status: 400,
                    message: 'Invalid hostname'
                };
            }

            if (!username || !password) {
                throw {
                    status: 400,
                    message: 'Username or password missing'
                };
            }

            let account: IAccountDocument;
            let user: IUserDocument;

            that._Account.findAccountByHostname(hostname)
                .then((acct: IAccountDocument) => {
                    winston.debug('token: account found');
                    account = acct;
                    return that._appContext.User.authenticate(username, password);
                })
                .then((u: IUserDocument) => {
                    return u.generateToken(account.database.name, username, password, ip, clientId, clientDetails).then(token => {
                        // add the rest of the info to the user token
                        token.subdomain = hostname.split('.')[0];
                        token.email = username;
                        token.fullName = u.profile.firstName + ' ' + u.profile.lastName;
                        token.companyName = account.name;

                        return token;
                    });
                })
                .then((userToken: IUserToken) => {
                    resolve(userToken);
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
}