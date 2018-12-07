import { config } from '../../configuration/config';
import { IEmailService } from './email.service';
import * as nodemailer from 'nodemailer';
import * as mg from 'nodemailer-mailgun-transport';
import * as Promise from 'bluebird';

export const MailgunService: IEmailService = {
    sendEmail(from: string, to: string, subject: string, html: string, ccEmail?: string): Promise<nodemailer.SentMessageInfo> {
        return new Promise<nodemailer.SentMessageInfo>((resolve, reject) => {

            let auth = config.emailService.mailgun;
            let nodemailerMailgun = nodemailer.createTransport(mg(auth));

            const sendEmailPayload = {
                from: from,
                to: to,
                subject: subject,
                html: html
            };

            if (ccEmail) {
                Object.assign(sendEmailPayload, {
                    cc: ccEmail
                });
            }

            nodemailerMailgun.sendMail(sendEmailPayload, (err, info) => {
                if (err) {
                    reject(err);
                }
                resolve(info);
            });

        });
    }
};
