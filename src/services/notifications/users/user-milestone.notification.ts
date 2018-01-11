import { IEmailNotifier } from '../email-notifier';
import { IAppConfig } from '../../../configuration/config-models';
import { IUserDocument } from '../../../domain/app/security/users/user';
import { sendEmail } from '../../email/email.service';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

export interface IUserMilestoneNotifier extends IEmailNotifier { }

export interface UserMilestoneNotifyData {
    hostname: string;
}

export class UserMilestoneNotification implements IEmailNotifier {
    constructor(@inject('Config') private _config: IAppConfig,
                private _data: UserMilestoneNotifyData) { }

    notify(user: IUserDocument, email?: string, data?: any): Promise<nodemailer.SentMessageInfo> {

        const userMilestoneTemplate =
        Handlebars.compile(this._config.usersService.services.userMilestone.emailTemplate);

        let dataSource = user.toObject();

        (<any>dataSource).host = this._data.hostname.split('.')[0] || this._data.hostname;
        (<any>dataSource).subdomain = this._config.subdomain;


        let emailContent = userMilestoneTemplate(dataSource);

        return sendEmail(email, `${this._config.usersService.app.name}: You have added to be responsible of a milestones called: ${data.task}, that expire in ${data.dueDate}`, emailContent);
    }
}