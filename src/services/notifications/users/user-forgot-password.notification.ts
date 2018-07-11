import { sendEmail } from '../../email/email.service';
import * as Promise from 'bluebird';
import * as Handlebars from 'handlebars';
import { inject, injectable } from 'inversify';
import * as nodemailer from 'nodemailer';

import { IAppConfig } from '../../../configuration/config-models';
import { IUserDocument, IUserForgotPasswordDataSource } from '../../../domain/app/security/users/user';
import { IEmailNotifier } from '../email-notifier';
import { CurrentAccount } from '../../../domain/master/current-account';
import {IExtendedRequest} from '../../../middlewares/extended-request';

export interface IForgotPasswordNotifier extends IEmailNotifier { }


@injectable()
export class UserForgotPasswordNotification implements IEmailNotifier {

    constructor(
        @inject('Config') private _config: IAppConfig,
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
        @inject('Request') private _request: IExtendedRequest
    ) { }

    notify(user: IUserDocument, email: string, data?: any): Promise<nodemailer.SentMessageInfo> {
        const forgotPasswordTemplate =
            Handlebars.compile(this._config.usersService.services.forgotPassword.emailTemplate);

        const dataSource: IUserForgotPasswordDataSource = user.toObject();

        if (!user.profile.firstName || !user.profile.lastName) {
            dataSource.fullName = user.username;
        } else {
            dataSource.fullName = `${user.profile.firstName} ${user.profile.lastName}`;
        }

        if (this._request.body.operationName === 'userForgotPassword' &&
            this._request.body.variables &&
            this._request.body.variables.companyName) {
            dataSource.companyName = this._currentAccount.get.database.name;
        }

        dataSource.host = this._currentAccount.get.database.name; // hostname;
        dataSource.subdomain = this._config.subdomain;

        dataSource.resetToken = user.services.password.reset.token;

        const emailContent = forgotPasswordTemplate(dataSource);
        const ccEmail: string = this._config.supportEmail;

        return sendEmail(email, `${this._config.usersService.app.name}: Forgot Password`, emailContent, ccEmail);
    }
}