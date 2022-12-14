import { IAppConfig } from '../../../configuration/config-models';
import { IUserDocument } from '../../../domain/app/security/users/user';
import { IEmailNotifier } from '../email-notifier';
import { sendEmail } from '../../email/email.service';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

@injectable()
export class TargetNotification implements IEmailNotifier {
    constructor(@inject('Config') private _config: IAppConfig) { }

    notify(user: IUserDocument, email: string, data?: any): Promise<nodemailer.SentMessageInfo> {
        const targetNotificationTemplate =
            Handlebars.compile(this._config.usersService.services.targetNotification.emailTemplate);

        let dataSource: any = user.toObject();

        if (!user.profile.firstName || !user.profile.lastName) {
            dataSource.name = user.username;
        } else {
            dataSource.name = user.profile.firstName + ' ' + user.profile.lastName;
        }

        dataSource.targetName = data.targetName;
        dataSource.targetAmount = data.targetAmount;
        dataSource.targetDate = data.targetDate;
        dataSource.targetMet = data.targetMet;
        dataSource.dashboardName = data.dashboardName;
        dataSource.chartName = data.chartName;
        dataSource.businessUnitName = data.businessUnitName;

        const emailContent = targetNotificationTemplate(dataSource);
        return sendEmail(email, `Target Notification`, emailContent);
    }
}