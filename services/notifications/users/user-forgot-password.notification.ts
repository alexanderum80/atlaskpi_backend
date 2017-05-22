import { IUserDocument } from '../../../data';
import { IEmailNotifier } from '../email-notifier';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as winston from 'winston';
import { sendEmail } from '../..';
import { IAppConfig } from '../../../config';

export interface IForgotPasswordNotifier extends IEmailNotifier { }

export interface ResetPasswordNotifyData {
    hostname: string;
}

export class UserForgotPasswordNotification implements IEmailNotifier {

    constructor(private _config: IAppConfig,
                private _data: ResetPasswordNotifyData) { }

    notify(user: IUserDocument, email: string, data?: any): Promise<nodemailer.SentMessageInfo> {
        const forgotPasswordTemplate =
            Handlebars.compile(this._config.usersService.services.forgotPassword.emailTemplate);

        let dataSource = user.toObject();

        if (!user.profile.firstName || !user.profile.lastName) {
            (<any>dataSource).fullName = user.username;
        } else {
            (<any>dataSource).fullName = `${user.profile.firstName} ${user.profile.lastName}`;
        };

        if (this._data.hostname) {
            Object.assign(dataSource, this._data);
        } else {
            winston.error('Error sending notification: ', 'no hostname provided');
            throw { status: 400, message: 'Invalid hostname' };
        };

        (<any>dataSource).resetToken = user.services.password.reset.token;

        let emailContent = forgotPasswordTemplate(dataSource);

        return sendEmail(email, `${this._config.usersService.app.name}: Forgot Password`, emailContent);
    }
}