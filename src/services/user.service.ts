import { Roles } from '../domain/app/security/roles/role.model';
import { UserDetails } from '../app_modules/users/users.types';
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
        @inject(Roles.name) private _roles: Roles,
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
            }).catch(err => reject(err));
        });
    }

    updateUser(input: { id: string, data: UserDetails }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            // get email address by id
            that._users.model.findById(input.id).then(userDocument => {
                const userEmail = userDocument.emails.map(e => e.address);
                const inputEmail = input.data.email;

                // check if user did not modify email address
                // to allow user to save same email address
                if (userEmail.indexOf(inputEmail) !== -1) {
                    // update user if user is saving the same email
                    that._roles.model.findAllRoles('').then(roles => {
                        that._users.model.updateUser(input.id, input.data, roles).then(updatedUser => {
                            resolve(updatedUser);
                            return;
                        }).catch(err => reject(err));
                    });
                } else {
                    that.userEmailExists(input.data).then(user => {
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

                        that._roles.model.findAllRoles('').then(roles => {
                            that._users.model.updateUser(input.id, input.data, roles).then(updatedUser => {
                                resolve(updatedUser);
                                return;
                            }).catch(err => reject(err));
                        });
                    }).catch(err => reject(err));
                }
            });
        });
    }

    userEmailExists(data: ICreateUserDetails|UserDetails): Promise<IUserDocument> {
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