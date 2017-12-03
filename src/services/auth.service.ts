import { IAppConfig } from '../configuration/config-models';
import { IUserToken, IAccountDocument, IUserDocument, Accounts, Users } from '../domain';
import { injectable, inject } from 'inversify';
import { Winston } from 'winston';

export interface IUserAuthenticationData {
    hostname: string;
    username: string;
    password: string;
    ip: string;
    clientId: string;
    clientDetails: string;
}

@injectable()
export class AuthService {

    constructor(
        @inject('Config') private _config: IAppConfig,
        @inject('Accounts') private _accounts: Accounts,
        @inject('Users') private _users: Users,
        @inject('logger') private _logger: Winston ) { }

    authenticateUser(input: IUserAuthenticationData): Promise < IUserToken > {
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
                .then((u: IUserDocument) => {
                    return u.generateToken(account.database.name, input.username, input.password, input.ip, input.clientId, input.clientDetails, that._config.token.expiresIn).then(token => {
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

}