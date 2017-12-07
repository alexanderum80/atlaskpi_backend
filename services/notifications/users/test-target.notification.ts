import { IUserDocument } from '../../../data/models/app/users/index';
import { sendEmail } from '../../email/index';
import { EnrollmentNotifyData } from './index';
import { IAppConfig } from '../../../configuration/config-models';
import { IEmailNotifier } from '../email-notifier';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';

export interface ITestTargetInfo {
    id?: string;
    _id?: string;
}

export class TestTargetNotification implements IEmailNotifier {
    constructor(private _config: IAppConfig,
                private _data: EnrollmentNotifyData) { }
    // needs: targetName, targetAmount (target), targetDate (datepicker), dashboard name, chart name
    notify(user: IUserDocument, email: string, data?: any): Promise<nodemailer.SentMessageInfo> {
        const testTargetNotificationTemplate =
            Handlebars.compile(this._config.usersService.services.testNotification.emailTemplate);

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

        const emailContent = testTargetNotificationTemplate(dataSource);
        return sendEmail(email, `${this._config.usersService.app.name}: Target Notification`, emailContent);
    }
}