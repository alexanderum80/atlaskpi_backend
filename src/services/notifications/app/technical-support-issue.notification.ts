import { ISupportEmailNotifier } from '../';
import { createDeflate } from 'zlib';
import { IUserDocument } from '../../../data';
import { IEmailNotifier } from '../email-notifier';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { sendEmail } from '../..';
import { IAppConfig } from '../../../configuration';
import * as _ from 'lodash';

export enum IssueLevelEnum {
    Critical,
    NonCritical,
    Info
}

export const  IssueLevelTable = {
    1: IssueLevelEnum.Info,
    5: IssueLevelEnum.NonCritical,
    10: IssueLevelEnum.Critical,
};

export function getIssueLevelPropName(level: IssueLevelEnum) {
    switch (level) {
        case IssueLevelEnum.Info:
            return 'Info';
        case IssueLevelEnum.NonCritical:
            return 'Non-Critical';
        case IssueLevelEnum.Critical:
            return 'Critical';
    }
}

export interface IssueData {
    timestamp: string | Date;
    ip: string;
    hostname: string;
    clientId: string;
    clientDetails: string;

    level: string | number;
    message: string;
}

export class TechnicalSupportIssueNotification implements ISupportEmailNotifier {

    constructor(private _config: IAppConfig) { }

    notify(data: IssueData): Promise<nodemailer.SentMessageInfo> {
        // copy values
        const details: IssueData = Object.assign({}, data);

        if (_.isNumber(details.level)) {
            details.level = getIssueLevelPropName(IssueLevelTable[details.level]);
        }

        if (_.isDate(details.timestamp)) {
            details.timestamp = details.timestamp.toUTCString();
        }

        const notifyIssueTemplate =
            Handlebars.compile(this._config.appServices.services.notifySupport.emailTemplate);

        const body = notifyIssueTemplate(details);

        return sendEmail('technical-support@atlaskpi.com', `Technical Support Issue: ${details.level}`, body);
    }
}
