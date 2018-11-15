import { Alerts } from '../domain/app/alerts/alert.model';
import { IRoleDocument } from '../domain/app/security/roles/role';
import { Roles } from '../domain/app/security/roles/role.model';
import { UserDetails } from '../app_modules/users/users.types';
import { AccountCreatedNotification } from './notifications/users/account-created.notification';
import { IMutationResponse } from '../framework/mutations/mutation-response';
import { ICreateUserDetails } from '../domain/common/create-user';
import { Users } from '../domain/app/security/users/user.model';
import { IUserDocument, IUserEmail, IUserPreference } from '../domain/app/security/users/user';
import { inject, injectable } from 'inversify';
import { CurrentUser } from '../domain/app/current-user';
import { Attachments } from '../domain/app/attachments/attachment-model';
import { AttachmentTypeEnum, AttachmentCategoryEnum } from '../domain/app/attachments/attachment';
import { Logger } from '../domain/app/logger';
import { UserAttachmentsService } from './attachments/user-attachments.service';
import { isEmpty, find } from 'lodash';

@injectable()
export class UserService {
    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(Users.name) private _users: Users,
        @inject(Alerts.name) private _alerts: Alerts,
        @inject(Roles.name) private _roles: Roles,
        @inject(CurrentUser.name) private _currentUser: CurrentUser,
        @inject(UserAttachmentsService.name) private _userAttachmentService: UserAttachmentsService,
        @inject(AccountCreatedNotification.name) private _accountCreatedNotification: AccountCreatedNotification
    ) {}

    async getCurrentUserInfo(aUser?: IUserDocument): Promise<IUserDocument> {
        const defaultPreferences : IUserPreference = {
            charts: {
                listMode: "tableView"
            },
            kpis: {
                listMode: "tableView"
            },
            dashboards: {
                listMode: "standardView"
            },
            roles: {
                listMode: "standardView"
            },
            users: {
                listMode: "standardView"
            },
            theme: "light"
        }
        
        try {
            let user: IUserDocument;
            if (aUser) {
                user = aUser;
            } else {
                user = this._currentUser.get().toObject() as IUserDocument;
                user.ownerAgreed = await this._hasOwnerAgreed(user);
            }

            user.profilePictureUrl = await this._userAttachmentService.getUrl(
                AttachmentCategoryEnum.User,
                AttachmentTypeEnum.ProfilePicture,
                user._id.toString()
            );

         const mergedPreferences =  Object.assign(defaultPreferences, user.preferences);

         user.preferences = mergedPreferences;

            return user;
        } catch (e) {
            this._logger.error('There was an error getting the current user', e);
        }
    }

    async removeUser(id: string): Promise<IMutationResponse> {
        try {
            if (!id) {
                throw new Error('missing id to remove user');
            }

            const removeCurrentUser = await this._users.model.removeUser(id);
            if (removeCurrentUser) {
                const removeDeletedUserFromAlerts = await this._alerts.model
                                                            .removeDeleteUser(removeCurrentUser.entity._id);
            }

            return removeCurrentUser;
        } catch (err) {
            this._logger.error('There was an removing the current user', err);
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

    private async _hasOwnerAgreed(currentUser: IUserDocument): Promise<boolean> {
        // check if current user is the owner
        const isCurrentUserOwner = currentUser.roles.find(role => role.name === 'owner');

        if (isCurrentUserOwner) {
            if (isEmpty(currentUser.profile)) {
                return false;
            }
            // check if current user has agreement
            if (!isEmpty(currentUser.profile.agreement)) {
                return currentUser.profile.agreement.accept;
            }

            // return false user has no agreement subdocument
            return false;
        }

        const users: IUserDocument[] = await this._users.model.find().populate('roles');

        // filter users that has owner role
        const owners: any[] = users.filter(user => user.roles.find(role => role.name === 'owner'));
        // filter owners that has profile
        const ownersWithProfile = owners.filter(o => !isEmpty(o.profile));

        if (ownersWithProfile && ownersWithProfile.length) {
            // find owner that has agreement object
            const findAgreement = find(ownersWithProfile, (ownerProfile) => {
                const owner = ownerProfile.toObject();
                return !isEmpty(owner.profile.agreement);
            });

            // return accept value if user has agreement
            if (findAgreement) {
                const agreementObject = findAgreement.toObject();
                return agreementObject.profile.agreement.accept;
            }
            // return if user agreement isn't there
            return false;
        }
        // return false if no owner has a profile
        return false;
    }
}