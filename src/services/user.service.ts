import { AccountCreatedNotification } from './notifications/users/account-created.notification';
import { IMutationResponse } from '../framework/mutations/mutation-response';
import { ICreateUserDetails } from '../domain/common/create-user';
import { Users } from '../domain/app/security/users/user.model';
import { ICreateUserOptions, IUserDocument } from '../domain/app/security/users/user';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

@injectable()
export class UserService {
    constructor(
        @inject(Users.name) private _users: Users,
        @inject(AccountCreatedNotification.name) private _accountCreatedNotification: AccountCreatedNotification
    ) {}
    createUser(data: ICreateUserDetails): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that.userEmailExists(data).then(res => {
                if (res) {
                    resolve({
                        success: false,
                        entity: null,
                        errors: [
                            {
                                field: 'user',
                                errors: ['Email already exists']
                            }
                        ]
                    });
                    return;
                }
                return that._users.model.createUser(data, that._accountCreatedNotification);
            }).catch(err => {
                resolve({
                    success: false,
                    entity: null,
                    errors: err
                });
            });
        });
    }

    userEmailExists(data: ICreateUserDetails): Promise<string[]> {
        const that = this;

        return new Promise<string[]>((resolve, reject) => {
            if (!data || !data.email) {
                reject('No email provided');
                return;
            }

            that._users.model.findByEmail(data.email).then(res => {
                return resolve(res.emails.map(r => r.address));
            }).catch(err => reject(err));
        });
    }
}