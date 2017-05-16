import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';
import { config } from '../../config';

// import providers
import { MailgunService } from './mailgun.email.service';

export function sendEmail(to: string, subject: string, html: string): Promise<nodemailer.SentMessageInfo> {

    // send email function
    let sendFunction: (from: string, to: string, subject: string, html: string) => Promise<nodemailer.SentMessageInfo>;

    // send email with right provider
    switch (config.emailService.provider) {
        case 'mailgun':
            sendFunction = MailgunService.sendEmail;
            break;
    }

    // send email
    return sendFunction(config.emailService.from, to, subject, html);
}