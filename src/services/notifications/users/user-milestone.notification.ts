import { CurrentAccount } from '../../../domain/master/current-account';
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

@injectable()
export class UserMilestoneNotification implements IEmailNotifier {
    constructor(
        @inject('Config') private _config: IAppConfig,
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount
    ) { }

    notify(user: IUserDocument, email?: string, data?: any): Promise<nodemailer.SentMessageInfo> {

        const userMilestoneTemplate =
        Handlebars.compile(this._config.usersService.services.userMilestone.emailTemplate);

        const dataSource = {
            task: data.task,
            dueDate: data.dueDate,
            fullName: data.fullName
        };

        const emailContent = userMilestoneTemplate(dataSource);
        return sendEmail(email, `${this._config.usersService.app.name}: Milestone Notification`, emailContent);
    }
}