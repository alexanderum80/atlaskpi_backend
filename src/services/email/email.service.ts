import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';

import { config } from '../../configuration/config';
import { MailgunService } from './mailgun.email.service';

export interface IEmailService {
    sendEmail(from: string, to: string|string[], subject: string, html: string, ccEmail?: string): Promise<nodemailer.SentMessageInfo>;
}


// import providers
export function sendEmail(to: string|string[], subject: string, html: string, ccEmail?: string): Promise<nodemailer.SentMessageInfo> {

    // send email function
    let sendFunction: (from: string, to: string|string[], subject: string, html: string, ccEmail?: string) => Promise<nodemailer.SentMessageInfo>;

    // send email with right provider
    switch (config.emailService.provider) {
        case 'mailgun':
            sendFunction = MailgunService.sendEmail;
            break;
    }

    // send email
    return sendFunction(config.emailService.from, to, subject, html, ccEmail);
}