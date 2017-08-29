import { createDeflate } from 'zlib';
import { IUserDocument } from '../../../data';
import { IEmailNotifier } from '../email-notifier';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { sendEmail } from '../..';
import { IAppConfig } from '../../../configuration';

export interface IAccountCreatedNotifier extends IEmailNotifier {

}

export class AccountCreatedNotification implements IAccountCreatedNotifier {

    constructor(private _config: IAppConfig) { }

    notify(user: IUserDocument, email?: string, data?: any): Promise<nodemailer.SentMessageInfo> {

        const createAccountTemplate =
            Handlebars.compile(this._config.usersService.services.createUser.emailTemplate);

        let dataSource = user.toObject();
        let emailContent = createAccountTemplate(dataSource);

        return sendEmail(email, `${this._config.usersService.app.name}: Account Created`, emailContent);
    }
}
