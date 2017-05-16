import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';

export interface IEmailService {
    sendEmail(from: string, to: string, subject: string, html: string): Promise<nodemailer.SentMessageInfo>;
}