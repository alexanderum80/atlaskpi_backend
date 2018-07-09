import { sendEmail } from '../../email/email.service';
import * as Promise from 'bluebird';
import * as Handlebars from 'handlebars';
import { inject, injectable } from 'inversify';
import * as nodemailer from 'nodemailer';

import { IAppConfig } from '../../../configuration/config-models';
import { IAccountCreatedDataSource, IUserDocument } from '../../../domain/app/security/users/user';
import { IEmailNotifier } from '../email-notifier';
import { CurrentAccount } from '../../../domain/master/current-account';


export interface IAccountCreatedNotifier extends IEmailNotifier {

}

@injectable()
export class AccountCreatedNotification implements IAccountCreatedNotifier {

    constructor(@inject('Config') private _config: IAppConfig,
                @inject(CurrentAccount.name) private _currentAccount: CurrentAccount) { }

    notify(user: IUserDocument, email: string, data?: any): Promise<nodemailer.SentMessageInfo> {

        const createAccountTemplate =
            Handlebars.compile(this._config.usersService.services.createUser.emailTemplate);

        const dataSource: IAccountCreatedDataSource = user.toObject();
        if (!dataSource.host) {
            dataSource.host = this._currentAccount.get.database.name;
        }
        if (!dataSource.subdomain) {
            dataSource.subdomain = this._config.subdomain;
        }
        if (!dataSource.resetToken) {
            dataSource.resetToken = user.services.email.enrollment[0].token;
        }

        const emailContent = createAccountTemplate(dataSource);
        const ccEmail: string = this._config.supportEmail;

        return sendEmail(email, `${this._config.usersService.app.name}: Account Created`, emailContent, ccEmail);
    }
}
