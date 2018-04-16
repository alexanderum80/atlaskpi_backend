import { IRoleDocument } from '../domain/app/security/roles/role';
import { Roles } from '../domain/app/security/roles/role.model';
import { UserDetails } from '../app_modules/users/users.types';
import { AccountCreatedNotification } from './notifications/users/account-created.notification';
import { IMutationResponse } from '../framework/mutations/mutation-response';
import { ICreateUserDetails } from '../domain/common/create-user';
import { Users } from '../domain/app/security/users/user.model';
import { IUserDocument, IUserEmail } from '../domain/app/security/users/user';
import { inject, injectable } from 'inversify';
import { CurrentUser } from '../domain/app/current-user';
import { Attachments } from '../domain/app/attachments/attachment-model';
import { AttachmentTypeEnum, AttachmentCategoryEnum } from '../domain/app/attachments/attachment';
import { Logger } from '../domain/app/logger';
import { UserAttachmentsService } from './attachments/user-attachments.service';

@injectable()
export class UserService {
    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(Users.name) private _users: Users,
        @inject(Roles.name) private _roles: Roles,
        @inject(CurrentUser.name) private _currentUser: CurrentUser,
        @inject(UserAttachmentsService.name) private _userAttachmentService: UserAttachmentsService,
        @inject(AccountCreatedNotification.name) private _accountCreatedNotification: AccountCreatedNotification
    ) {}

    async getCurrentUserInfo(): Promise<IUserDocument> {
        try {
            const user = this._currentUser.get().toObject() as IUserDocument;
            user.profilePictureUrl = await this._userAttachmentService.getUrl(
                AttachmentCategoryEnum.User,
                AttachmentTypeEnum.ProfilePicture,
                user._id.toString()
            );

            return user;
        } catch (e) {
            this._logger.error('There was an error getting the current user', e);
        }
    }

    updateUser(input: { id: string, data: UserDetails }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            // get email address by id
            that._users.model.findById(input.id).then((userDocument: IUserDocument) => {
                const userEmail: string[] = userDocument.emails.map((e: IUserEmail) => e.address.toLowerCase());
                const inputEmail: string = input.data.email.toLowerCase();

                // check if user did not modify email address
                // to allow user to save same email address
                if (userEmail.indexOf(inputEmail) !== -1) {
                    that._updateUser(input).then(user => {
                        resolve(user);
                    }).catch(err => reject(err));
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

                        that._updateUser(input).then(user => {
                            resolve(user);
                        }).catch(err => reject(err));

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