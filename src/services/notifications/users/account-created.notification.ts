import { IAccountCreatedDataSource, IUserDocument } from '../../../domain/app/security/users';
import { createDeflate } from 'zlib';
import { IEmailNotifier } from '../email-notifier';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { sendEmail } from '../..';
import { IAppConfig } from '../../../configuration';
import { injectable, inject } from 'inversify';

export interface IAccountCreatedNotifier extends IEmailNotifier {

}

@injectable()
export class AccountCreatedNotification implements IAccountCreatedNotifier {

    constructor(@inject('Config') private _config: IAppConfig) { }

    notify(user: IUserDocument, hostname: string, email?: string, data?: any): Promise<nodemailer.SentMessageInfo> {

        const createAccountTemplate =
            Handlebars.compile(this._config.usersService.services.createUser.emailTemplate);

        let dataSource: IAccountCreatedDataSource = user.toObject();
        if (!dataSource.host) {
            dataSource.host = hostname;
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
