import { sendEmail } from '../../email/email.service';
import * as Promise from 'bluebird';
import * as Handlebars from 'handlebars';
import { inject, injectable } from 'inversify';
import * as nodemailer from 'nodemailer';

import { IAppConfig } from '../../../configuration/config-models';
import { IUserDocument } from '../../../domain/app/security/users/user';
import { IEmailNotifier } from '../email-notifier';
import { CurrentAccount } from '../../../domain/master/current-account';
import {IExtendedRequest} from '../../../middlewares/extended-request';

export interface ICommentNotifier extends IEmailNotifier { }


@injectable()
export class CommentNotification implements IEmailNotifier {

    constructor(
        @inject('Config') private _config: IAppConfig,
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
        @inject('Request') private _request: IExtendedRequest
    ) { }

    notify(user: IUserDocument, email: string, data?: any): Promise<nodemailer.SentMessageInfo> {
        const CommentTemplate =
            Handlebars.compile(this._config.usersService.services.commentNotification.emailTemplate);

        const dataSource: any = user.toObject();

        if (!user.profile.firstName || !user.profile.lastName) {
            dataSource.fullName = user.username;
        } else {
            dataSource.fullName = `${user.profile.firstName} ${user.profile.lastName}`;
        }

        dataSource.method = this._config.templateHttpMethod;
        dataSource.host = this._currentAccount.get.subdomain; // hostname;
        dataSource.subdomain = this._config.subdomain;

        dataSource.resetToken = user.services.password.reset.token;
        dataSource.dashboardId = data.dashboardId;
        dataSource.createdBy = data.from.profile.firstName + ' ' + data.from.profile.lastName;
        const emailContent = CommentTemplate(dataSource);
        const ccEmail: string = this._config.supportEmail;

        console.log('email to: ' + email);
        console.log('email Content: ' + emailContent);
        console.log('ccEmail: ' + ccEmail);

        return sendEmail(email, `${this._config.usersService.app.name}: Comment Notify`, emailContent, ccEmail);
    }
}