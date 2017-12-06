import { IUserDocument, IUserForgotPasswordDataSource } from '../../../data';
import { IEmailNotifier } from '../email-notifier';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as winston from 'winston';
import { sendEmail } from '../..';
import { IAppConfig } from '../../../configuration';
import { injectable, inject } from 'inversify';

export interface IForgotPasswordNotifier extends IEmailNotifier { }


@injectable()
export class UserForgotPasswordNotification implements IEmailNotifier {

    constructor(@inject('Config') private _config: IAppConfig) { }

    notify(user: IUserDocument, hostname: string, email: string, data?: any): Promise<nodemailer.SentMessageInfo> {
        const forgotPasswordTemplate =
            Handlebars.compile(this._config.usersService.services.forgotPassword.emailTemplate);

        let dataSource: IUserForgotPasswordDataSource = user.toObject();

        if (!user.profile.firstName || !user.profile.lastName) {
            dataSource.fullName = user.username;
        } else {
            dataSource.fullName = `${user.profile.firstName} ${user.profile.lastName}`;
        }

        dataSource.host = hostname;
        dataSource.subdomain = this._config.subdomain;

        dataSource.resetToken = user.services.password.reset.token;

        let emailContent = forgotPasswordTemplate(dataSource);

        return sendEmail(email, `${this._config.usersService.app.name}: Forgot Password`, emailContent);
    }
}