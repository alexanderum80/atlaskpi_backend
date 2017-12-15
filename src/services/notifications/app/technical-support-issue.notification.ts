import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isDate, isNumber } from 'lodash';
import * as nodemailer from 'nodemailer';

import { IAppConfig } from '../../../configuration/config-models';
import { ISupportEmailNotifier } from '../email-notifier';


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

@injectable()
export class TechnicalSupportIssueNotification implements ISupportEmailNotifier {

    constructor(@inject('Config') private _config: IAppConfig) { }

    notify(data: IssueData): Promise<nodemailer.SentMessageInfo> {
        // copy values
        const details: IssueData = Object.assign({}, data);

        if (isNumber(details.level)) {
            details.level = getIssueLevelPropName(IssueLevelTable[details.level]);
        }

        if (isDate(details.timestamp)) {
            details.timestamp = details.timestamp.toUTCString();
        }

        const notifyIssueTemplate =
            Handlebars.compile(this._config.appServices.services.notifySupport.emailTemplate);

        const body = notifyIssueTemplate(details);

        return sendEmail('technical-support@atlaskpi.com', `Technical Support Issue: ${details.level}`, body);
    }
}
