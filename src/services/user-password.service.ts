import { from } from 'apollo-link/lib';
import { CommentNotification } from './notifications/users/comment.notification';
import { inject, injectable } from 'inversify';
import { Connection } from 'mongoose';
import { IExtendedRequest } from '../middlewares/extended-request';
import { AppConnectionPool } from '../middlewares/app-connection-pool';
import { MasterConnection } from '../domain/master/master.connection';
import { UserForgotPasswordNotification } from './notifications/users/user-forgot-password.notification';
import { Users } from '../domain/app/security/users/user.model';
import { AppConnection } from '../domain/app/app.connection';
import { IAppConfig } from '../configuration/config-models';
import { Accounts } from '../domain/master/accounts/account.model';
import { CurrentAccount } from '../domain/master/current-account';
import { ErrorSuccessResult } from '../app_modules/users/users.types';
import { SentMessageInfo } from 'nodemailer';
import {AccessLogs} from '../domain/app/access-log/access-log.model';
import {IUserProfile} from '../domain/app/security/users/user';
import {IMutationResponse} from '../framework/mutations/mutation-response';
import { pick } from 'lodash';
import {IAccountDocument} from '../domain/master/accounts/Account';

interface IUserPassword {
    email?: string;
    companyName?: string;
    token?: string;
    password?: string;
    profile?: IUserProfile;
    enrollment: boolean;
}

@injectable()
export class UserPasswordService {
    private _user: Users;
    private _userForgotPasswordNotification: UserForgotPasswordNotification;
    private _commentNotificacion: CommentNotification;
    private _connection: Connection;
    private _appConnection: AppConnection;
    private _currentAccount: CurrentAccount;
    private _accessLogs: AccessLogs;

    private _payload: IUserPassword;

    constructor(
        @inject('Config') private _config: IAppConfig,
        @inject(MasterConnection.name) private _masterConnection: MasterConnection,
        @inject(Accounts.name) private _account: Accounts,
        @inject('Request') private _request: IExtendedRequest,
        @inject(AppConnectionPool.name) private _appConnectionPool: AppConnectionPool
    ) {}

    async instantiateDependencies(data: IUserPassword, fromComment?: boolean) {
        this._payload = data;
        let account: IAccountDocument;

        if (data.companyName) {
            account = await this._account.model.findAccountByHostname(data.companyName);
            this._connection = await this._appConnectionPool.getConnection(account.getConnectionString());
        } else {
            this._connection = this._request.appConnection;
        }

        if (!this._connection) {
            throw new Error('no connection provided');
        }

        if (!account) {
            account = await this._account.model.findAccountByHostname((this._connection as any).name);
        }

        this._request.appConnection = this._connection;
        this._request.account = account;

        this._appConnection = new AppConnection(this._request);
        this._user = new Users(this._appConnection);

        this._currentAccount = new CurrentAccount(this._request);
        if (fromComment === true) {
            this._commentNotificacion = new CommentNotification(this._config, this._currentAccount, this._request);
        } else {
            this._userForgotPasswordNotification = new UserForgotPasswordNotification(this._config, this._currentAccount, this._request);
        }
    }

    async forgotPassword(): Promise<ErrorSuccessResult> {
        const email: string = this._payload.email;
        const forgotPasswordMutation: SentMessageInfo = await this._user.model.forgotPassword(
            email,
            this._config.usersService.usernameField,
            this._userForgotPasswordNotification
        );

        let success = false;
        if (forgotPasswordMutation) {
            success = true;
        }

        return { success: success };
    }

    async notifyComment(data): Promise<ErrorSuccessResult> {
        const notifyCommentMutation: SentMessageInfo = await this._user.model.sendCommentNotification(
            data.from,
            data.to,
            data.dashboardId,
            this._commentNotificacion
        );

        let success = false;
        if (notifyCommentMutation) {
            success = true;
        }

        return { success: success };
    }

    async isResetPasswordTokenValid(): Promise<boolean> {
        const token: string = this._payload.token;
        return await this._user.model.verifyResetPasswordToken(token, this._config.token.expiresIn);
    }

    async resetPassword(): Promise<IMutationResponse> {
        // data.token, data.password, data.profile, data.enrollment || false
        const data = pick(this._payload, ['token', 'password', 'profile', 'enrollment']);
        return await this._user.model.resetPassword(data.token, data.password, data.profile, data.enrollment || false);
    }
}