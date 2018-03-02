import { IRoleDocument } from '../domain/app/security/roles/role';
import { Roles } from '../domain/app/security/roles/role.model';
import { UserDetails } from '../app_modules/users/users.types';
import { AccountCreatedNotification } from './notifications/users/account-created.notification';
import { IMutationResponse } from '../framework/mutations/mutation-response';
import { ICreateUserDetails } from '../domain/common/create-user';
import { Users } from '../domain/app/security/users/user.model';
import { IUserDocument, IUserEmail } from '../domain/app/security/users/user';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

@injectable()
export class UserService {
    constructor(
        @inject(Users.name) private _users: Users,
        @inject(Roles.name) private _roles: Roles,
        @inject(AccountCreatedNotification.name) private _accountCreatedNotification: AccountCreatedNotification
    ) {}

    updateUser(input: { id: string, data: UserDetails }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            // get email address by id
            that._users.model.findById(input.id).then((userDocument: IUserDocument) => {
                const userEmail: string[] = userDocument.emails.map((e: IUserEmail) => e.address);
                const inputEmail: string = input.data.email;

                // check if user did not modify email address
                // to allow user to save same email address
                if (userEmail.indexOf(inputEmail) !== -1) {
                    return that._updateUser(input);
                } else {
                    that._users.model.findByEmail(input.data.email).then((user: IUserDocument) => {
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

                        return that._updateUser(input);

                    }).catch(err => reject(err));
                }
            });
        });
    }

    private _updateUser(input: { id: string, data: UserDetails }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            // update user if user is saving the same email
            that._roles.model.findAllRoles('').then((roles: IRoleDocument[]) => {
                that._users.model.updateUser(input.id, input.data, roles)
                    .then((updatedUser: IMutationResponse) => {
                        resolve(updatedUser);
                        return;
                    }).catch(err => reject(err));
            });

        });
    }
}