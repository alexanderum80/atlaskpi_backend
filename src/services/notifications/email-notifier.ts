import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';

import { IUserDocument } from '../../domain/app/security/users/user';

export interface IEmailNotifier {
    notify(user: IUserDocument, email: string, data?: any): Promise<nodemailer.SentMessageInfo>;
}

export interface ISupportEmailNotifier {
    notify(data?: any): Promise<nodemailer.SentMessageInfo>;
}