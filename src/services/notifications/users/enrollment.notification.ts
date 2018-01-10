import { sendEmail } from '../../email/email.service';
import * as Promise from 'bluebird';
import * as Handlebars from 'handlebars';
import { inject, injectable } from 'inversify';
import * as nodemailer from 'nodemailer';

import { IAppConfig } from '../../../configuration/config-models';
import { IUserDocument } from '../../../domain/app/security/users/user';
import { IEmailNotifier } from '../email-notifier';


export interface IEnrollmentNotifier extends IEmailNotifier { }

@injectable()
export class EnrollmentNotification implements IEnrollmentNotifier {

    constructor(@inject('Config') private _config: IAppConfig) { }

    notify(user: IUserDocument, email: string, hostname: string, data?: any): Promise<nodemailer.SentMessageInfo> {

        const enrollmentTemplate =
            Handlebars.compile(this._config.usersService.services.enrollment.emailTemplate);

        let dataSource = user.toObject();

        if (!user.profile.firstName || !user.profile.lastName) {
            (<any>dataSource).firstName = user.username;
        }

        (<any>dataSource).host = hostname;
        (<any>dataSource).subdomain = this._config.subdomain;
        (<any>dataSource).enrollmentToken = user.services.email.enrollment[0].token;

        let emailContent = enrollmentTemplate(dataSource);

        sendEmail(this._config.newAccountEmailNotification, 'New Account Created', emailContent);

        return sendEmail(email, `${this._config.usersService.app.name}: New Enrollment`, emailContent);
    }
}