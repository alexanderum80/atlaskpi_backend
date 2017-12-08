import { IUserDocument } from '../../../data/models/app/users/index';
import { sendEmail } from '../../email/index';
import { EnrollmentNotifyData } from './index';
import { IAppConfig } from '../../../configuration/config-models';
import { IEmailNotifier } from '../email-notifier';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';

export class TargetNotification implements IEmailNotifier {
    constructor(private _config: IAppConfig,
                private _data: EnrollmentNotifyData) { }

    notify(user: IUserDocument, email: string, data?: any): Promise<nodemailer.SentMessageInfo> {
        const targetNotificationTemplate =
            Handlebars.compile(this._config.usersService.services.targetNotification.emailTemplate);

        let dataSource: any = user.toObject();

        if (!user.profile.firstName || !user.profile.lastName) {
            dataSource.name = user.username;
        } else {
            dataSource.name = user.profile.firstName + ' ' + user.profile.lastName;
        }

        dataSource.host = this._data.hostname;
        dataSource.subdomain = this._config.subdomain;
        dataSource.targetName = data.targetName;
        dataSource.targetAmount = parseInt(data.targetAmount).toFixed(2);
        dataSource.targetDate = data.targetDate;
        dataSource.dashboardName = data.dashboardName;
        dataSource.chartName = data.chartName;
        dataSource.businessUnitName = data.businessUnitName;

        const emailContent = targetNotificationTemplate(dataSource);
        return sendEmail(email, `${this._config.usersService.app.name}: Target Notification`, emailContent);
    }
}