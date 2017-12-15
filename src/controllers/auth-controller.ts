import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { Winston } from 'winston';

import { IUserDocument } from '../domain/app/security/users/user';
import { IUserToken } from '../domain/app/security/users/user-token';
import { Users } from '../domain/app/security/users/user.model';
import { IAccountDocument } from '../domain/master/accounts/Account';
import { Accounts } from '../domain/master/accounts/account.model';

@injectable()
export class AuthController {
    status: string = 'intial value';

    constructor(
        @inject('Accounts') private _accounts: Accounts,
        @inject('logger') private _logger: Winston,
        @inject('Users') private _users: Users) {}

    authenticateUser(hostname: string, username: string, password: string, ip: string, clientId: string, clientDetails: string, secret: string, expiresIn: string): Promise < IUserToken > {
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

            that._accounts.model.findAccountByHostname(hostname)
                .then((acct: IAccountDocument) => {
                    that._logger.debug('token: account found');
                    account = acct;
                    return that._users.model.authenticate(username, password);
                })
                .then((u: IUserDocument) => {
                    return u.generateToken(account.database.name, username, password, ip, clientId, clientDetails, secret, expiresIn).then(token => {
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
                    that._logger.error('Error generating user token: ', err);

                    if (err && err.name === 'notfound') {
                        err.status = 404;
                    }

                    reject(err);
                });
        });
    }
}