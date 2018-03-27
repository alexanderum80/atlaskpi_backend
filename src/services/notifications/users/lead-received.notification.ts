import * as Promise from 'bluebird';
import * as Handlebars from 'handlebars';
import { inject, injectable } from 'inversify';
import * as nodemailer from 'nodemailer';

import { IAppConfig } from '../../../configuration/config-models';
import { ILeadDocument } from '../../../domain/master/leads/lead';
import { sendEmail } from '../../email/email.service';


@injectable()
export class LeadReceivedNotification {

    constructor(@inject('Config') private _config: IAppConfig) { }

    notify(info: ILeadDocument): Promise<nodemailer.SentMessageInfo> {

        const leadReceivedTemplate =
            Handlebars.compile(this._config.usersService.services.leadReceived.emailTemplate);

        let emailContent = leadReceivedTemplate(info);

        return sendEmail(this._config.newAccountEmailNotification, `${this._config.usersService.app.name}: Lead Received`, emailContent);
    }
}
