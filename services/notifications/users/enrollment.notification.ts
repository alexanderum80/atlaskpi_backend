import * as winston from 'winston';
import { IUserDocument } from '../../../data';
import { IEmailNotifier } from '../email-notifier';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { sendEmail } from '../..';
import { IAppConfig } from '../../../config';

export interface IEnrollmentNotifier extends IEmailNotifier { }

export interface EnrollmentNotifyData {
    hostname: string;
}

export class EnrollmentNotification implements IEnrollmentNotifier {

    constructor(private _config: IAppConfig,
                private _data: EnrollmentNotifyData) { }

    notify(user: IUserDocument, email: string, data?: any): Promise<nodemailer.SentMessageInfo> {

        const enrollmentTemplate =
            Handlebars.compile(this._config.usersService.services.enrollment.emailTemplate);

        let dataSource = user.toObject();

        if (!user.profile.firstName || !user.profile.lastName) {
            (<any>dataSource).firstName = user.username;
        };

        (<any>dataSource).host = this._data.hostname;
        (<any>dataSource).subdomain = this._config.subdomain;
        (<any>dataSource).enrollmentToken = user.services.email.enrollment[0].token;

        let emailContent = enrollmentTemplate(dataSource);

        return sendEmail(email, `${this._config.usersService.app.name}: New Enrollment`, emailContent);
    }
}