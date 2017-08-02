import { IUserDocument } from '../../data';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';

export interface IEmailNotifier {
    notify(user: IUserDocument, email: string, data?: any): Promise<nodemailer.SentMessageInfo>;
}