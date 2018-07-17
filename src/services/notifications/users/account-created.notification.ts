import { sendEmail } from '../../email/email.service';
import * as Promise from 'bluebird';
import * as Handlebars from 'handlebars';
import { inject, injectable } from 'inversify';
import * as nodemailer from 'nodemailer';

import { IAppConfig } from '../../../configuration/config-models';
import { IAccountCreatedDataSource, IUserDocument, IUserProfile } from '../../../domain/app/security/users/user';
import { IEmailNotifier } from '../email-notifier';
import { CurrentAccount } from '../../../domain/master/current-account';
import { isEmpty } from 'lodash';


export interface IAccountCreatedNotifier extends IEmailNotifier {

}

@injectable()
export class AccountCreatedNotification implements IAccountCreatedNotifier {

    constructor(@inject('Config') private _config: IAppConfig,
                @inject(CurrentAccount.name) private _currentAccount: CurrentAccount) { }

    notify(user: IUserDocument, email: string, data?: any): Promise<nodemailer.SentMessageInfo> {

        const createAccountTemplate =
            Handlebars.compile(this._config.usersService.services.createUser.emailTemplate);

        const dataSource: IAccountCreatedDataSource = user.toObject();
        if (!dataSource.host) {
            dataSource.host = this._currentAccount.get.subdomain;
        }
        if (!dataSource.subdomain) {
            dataSource.subdomain = this._config.subdomain;
        }
        if (!dataSource.resetToken) {
            dataSource.resetToken = user.services.email.enrollment[0].token;
        }

        dataSource.fullName = this._getFullName(user);

        const emailContent = createAccountTemplate(dataSource);
        return sendEmail(email, `AtlasKPI Secure: User Activation`, emailContent);
    }

    private _getFullName(user: IUserDocument): string {
        let fullName: string;

        if (!isEmpty(user.profile) && user.profile.firstName) {
            const userProfile: IUserProfile = user.profile;
            fullName = `${userProfile.firstName} ${userProfile.lastName}`;
        } else {
            fullName = user.username;
        }

        return fullName;
    }
}
