import { IRoleDocument } from '../domain/app/security/roles/role';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IAppConfig } from '../configuration/config-models';
import { Logger } from '../domain/app/logger';
import { Roles } from '../domain/app/security/roles/role.model';
import { IUserDocument } from '../domain/app/security/users/user';
import { IUserToken } from '../domain/app/security/users/user-token';
import { Users } from '../domain/app/security/users/user.model';
import { IAccountDocument } from '../domain/master/accounts/Account';
import { Accounts } from '../domain/master/accounts/account.model';


export interface IUserAuthenticationData {
    hostname: string;
    username: string;
    password: string;
    ip: string;
    clientId: string;
    clientDetails: string;
}

export interface IAuthErrorResponseObject {
    name: string;
    messsage: string;
}
export interface IAuthErrorResponse {
    NO_AGREEMENT: IAuthErrorResponseObject;
    NO_OWNER: IAuthErrorResponseObject;
    NO_ROLE: IAuthErrorResponseObject;
}

const errorResponse = {
    NO_AGREEMENT: { name: 'no agreement', message: 'user has not agreed to the terms' },
    NO_OWNER: { name: 'no owner', message: 'no owner exists' },
    NO_ROLE: { name: 'no role provided', message: 'no role provided for this user' }
};

@injectable()
export class AuthService {

    constructor(
        @inject('Config') private _config: IAppConfig,
        @inject(Accounts.name) private _accounts: Accounts,
        @inject(Users.name) private _users: Users,
        @inject(Roles.name) private _roles: Roles,
        @inject('Logger') private _logger: Logger ) { }

    authenticateUser(input: IUserAuthenticationData, createAccount= false): Promise < IUserToken > {
        let that = this;

        return new Promise <IUserToken> ((resolve, reject) => {
            if (!input.hostname) {
                reject('Invalid hostname');
            }

            if (!input.username || !input.password) {
                reject('Username or password missing');
            }

            let account: IAccountDocument;
            let user: IUserDocument;

            that._accounts.model.findAccountByHostname(input.hostname)
                .then((acct: IAccountDocument) => {
                    that._logger.debug('token: account found');
                    account = acct;
                    return that._users.model.authenticate(input.username, input.password, that._config.usersService.usernameField);
                })
                .then((accountUser: IUserDocument) => {
                    // check if this method is used for creating an account, not signing in
                    if (createAccount) {
                        return accountUser;
                    }
                    // check if user logging in is the owner
                    const isOwner = accountUser.roles.find((role: IRoleDocument) => role.name === 'owner');

                    if (!isOwner) {
                        return that._userAgreedToTerms(accountUser)
                            .then((user: IUserDocument) => {
                                // user will have agreed here
                                // 'user' is the same as 'accountUser'
                                return user;
                            }).catch(err => {
                                return Promise.reject(err);
                            });
                    }

                    // if owner, check if has agreed
                    if (!accountUser.agreement || !accountUser.agreement.accept) {
                        return Promise.reject(errorResponse.NO_AGREEMENT);
                    }

                    // return user if agreement has been accepted
                    return accountUser;
                })
                .then((u: IUserDocument) => {
                    return u.generateToken(
                        account.database.name,
                        input.username,
                        input.password,
                        input.ip,
                        input.clientId,
                        input.clientDetails,
                        that._config.token.secret,
                        that._config.token.expiresIn).then(token => {
                        // add the rest of the info to the user token
                        token.subdomain = input.hostname.split('.')[0];
                        token.email = input.username;
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

    private _userAgreedToTerms(user: IUserDocument): Promise<IUserDocument> {
        const that = this;

        return new Promise<IUserDocument>((resolve, reject) => {

        // roles has not been assigned
        // reject if that is the case
        if (!user.roles) {
            reject(errorResponse.NO_ROLE);
            return;
        }

        that._roles.model.findOne({ name: 'owner' })
            .then((role: IRoleDocument) => {
                // reject when no roles has been assigned to the user
                if (!role) {
                    reject(errorResponse.NO_ROLE);
                    return;
                }

                // find owner with the id provided
                that._users.model
                    .findOne({
                        roles: {
                            $in: [role._id]
                        }
                    })
                    .then((owner: IUserDocument) => {
                        if (!owner) {
                            reject(errorResponse.NO_OWNER);
                            return;
                        }

                        const hasAgreed: boolean = owner.agreement ? owner.agreement.accept : false;

                        if (hasAgreed) {
                            resolve(user);
                            return;
                        }

                        reject(errorResponse.NO_AGREEMENT);
                        return;
                    });
            });
        });
    }

}