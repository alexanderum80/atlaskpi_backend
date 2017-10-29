import { createDeflate } from 'zlib';
import { IUserDocument, IAccountCreatedDataSource } from '../../../data';
import { IEmailNotifier } from '../email-notifier';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { sendEmail } from '../..';
import { IAppConfig } from '../../../configuration';

export interface IAccountCreatedNotifier extends IEmailNotifier {

}


export class AccountCreatedNotification implements IAccountCreatedNotifier {

    constructor(private _config: IAppConfig, private _accountInfo?: any) { }

    notify(user: IUserDocument, email?: string, data?: any): Promise<nodemailer.SentMessageInfo> {

        const createAccountTemplate =
            Handlebars.compile(this._config.usersService.services.createUser.emailTemplate);

        let dataSource: IAccountCreatedDataSource = user.toObject();
        if (!dataSource.host) {
            dataSource.host = this._accountInfo.hostname.split('.')[0] || this._accountInfo.hostname.hostname;
        }
        if (!dataSource.subdomain) {
            dataSource.subdomain = this._config.subdomain;
        }
        if (!dataSource.resetToken) {
            dataSource.resetToken = user.services.email.enrollment[0].token;
        }
        let emailContent = createAccountTemplate(dataSource);

        return sendEmail(email, `${this._config.usersService.app.name}: Account Created`, emailContent);
    }
}
