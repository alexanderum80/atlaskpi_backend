import { AccountCreatedNotification } from './notifications/users/account-created.notification';
import { IMutationResponse } from '../framework/mutations/mutation-response';
import { ICreateUserDetails } from '../domain/common/create-user';
import { Users } from '../domain/app/security/users/user.model';
import { IUserDocument } from '../domain/app/security/users/user';
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
            that.userEmailExists(data).then(user => {
                if (user) {
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

                that._users.model.createUser(data, that._accountCreatedNotification).then(newUser => {
                    resolve(newUser);
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                resolve({
                    success: false,
                    entity: null,
                    errors: err
                });
            });
        });
    }

    userEmailExists(data: ICreateUserDetails): Promise<IUserDocument> {
        const that = this;

        return new Promise<IUserDocument>((resolve, reject) => {
            if (!data || !data.email) {
                reject('No email provided');
                return;
            }

            that._users.model.findByEmail(data.email).then(res => {
                return resolve(res);
            }).catch(err => reject(err));
        });
    }
}