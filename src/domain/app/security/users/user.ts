import { InputUserProfile } from '../../../../app_modules/users/users.types';
import * as Promise from 'bluebird';
import mongoose = require('mongoose');
import * as nodemailer from 'nodemailer';

import { IMutationResponse } from '../../../../framework/mutations/mutation-response';
import { IPagedQueryResult, IPaginationDetails } from '../../../../framework/queries/pagination';
import { IEmailNotifier } from '../../../../services/notifications/email-notifier';
import { IAccountCreatedNotifier } from '../../../../services/notifications/users/account-created.notification';
import { IEnrollmentNotifier } from '../../../../services/notifications/users/enrollment.notification';
import { IForgotPasswordNotifier } from '../../../../services/notifications/users/user-forgot-password.notification';
import { ICreateUserDetails } from '../../../common/create-user';
import { IRole, IRoleDocument, IRoleList } from '../roles/role';
import { IIdentity } from './identity';
import { IUserToken } from './user-token';



export interface IEmbeddedDocument {
    remove?();
}

export interface IUserEmail {
    address: string;
    verified: boolean;
}

export interface IUserLoginToken {
    when: Date;
    hashedToken: string;
    clientId: string;
}

export interface IUserEmailedToken extends IEmbeddedDocument {
    token: string;
    email: string;
    when: Date;
}

export interface IUserServices {
    loginTokens?: IUserLoginToken[];
    password?: {
        reset?: IUserEmailedToken
    };
    email?: {
        verificationTokens?: IUserEmailedToken[],
        enrollment?: IUserEmailedToken[],
    };
}

export interface IUserProfile {
    firstName: string;
    middleName?: string;
    lastName?: string;
    sex?: string;
    dob?: Date;
    // yojanier
    telephoneNumber: string;
}

export interface IShowTour {
    showTour: boolean;
}
// yojanier
export interface IUserNotifications {
    general?: boolean;
    chat?: boolean;
    emailNotification?: boolean;
    dnd?: boolean;
}
export interface IUserPreference {
    chart?: IShowTour;

    // yojanier
    notification?: IUserNotifications;
    avatarAddress?: string;
}

export interface ITokenInfo {
    ip: string;
    token: string;
    issued: Date;
    expires: Date;
    clientId: string;
    clientDetails: string;
}

export interface IMobileDevice {
    name: string;
    network: string;
    token: string;
}

export interface IAccountCreatedDataSource {
    host?: string;
    subdomain?: string;
    resetToken?: string;
    fullName?: string;
}

export interface IUserForgotPasswordDataSource extends IAccountCreatedDataSource {

}
export interface IUserProfileInput {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    telephoneNumber?: string;
    email?: string;
    general?: boolean;
    chat?: boolean;
    emailNotification?: boolean;
    dnd?: boolean;
}
export interface IUserProfileResolve {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    telephoneNumber?: string;
    email?: string;
    general?: boolean;
    chat?: boolean;
    emailNotification?: boolean;
    dnd?: boolean;
}

export interface IUser {
    username: string;
    password?: string;
    emails: IUserEmail[];
    services?: IUserServices;
    profile: IUserProfile;
    preferences?: IUserPreference;
    roles?: IRole[];
    tokens?: ITokenInfo[];
    mobileDevices?: IMobileDevice[];
}


// declare interface to mix account and mongo docuemnt properties/methods
export interface IUserDocument extends IUser, mongoose.Document {
    hasRole(role: string, done: (err: any, hasRole: boolean) => void): void;
    addRole(role: string, done?: (err: any, role: IRoleDocument) => void): void;
    addRoleBatches(role: string, done?: (err: any, role: IRoleDocument) => void): void;
    removeRole(role: string, done: (err: any) => void): void;
    can(action: string, subject: string, done: (err: any, hasPermission: boolean) => void): void;
    canAll(actionsAndSubjects: any[], done: (err: any, hasAll: boolean) => void): void;
    canAny(actionsAndSubjects: any[], done: (err: any, hasAll: boolean) => void): void;

    comparePassword(candidatePassword: String): Promise<boolean>;
    hasEmail(email): Boolean;
    addResetPasswordToken(email: string): void;
    addEnrollmentEmail(email: string): void;
    generateToken(accountName: string, username: string, password: string, ip: string, clientId: string, clientDetails: string, secret: string, expiresIn: string): Promise<IUserToken>;
}

export interface ITokenVerification {
    isValid: boolean;
    profile?: IUserProfile;
}

/**
 * Extra options provided when creating a new user account
 */
export interface ICreateUserOptions {
    notifyUser?: boolean;
    emailVerified?: boolean;
    host?: string;
}

/**
 * Defines the class methods for the User Model
 */
export interface IUserModel extends mongoose.Model<IUserDocument> {
    /**
     * Authenticate a user using the username and its password
     * @param {string} username - User's username or email
     * @param {string} password - User's password
     * @returns {Promise<IUserDocument>}
     */
    authenticate(username: string, password: string, usernameField: string): Promise<IUserDocument>;
    /**
     * Create a new user.
     * @param {ICreateUserDetails} details - new account information
     * @param {ICreateUserOptions} options - (Optional) options for the creation of the new user
     * @returns {Promise<IUserDocument>}
     */
    createUser(details: ICreateUserDetails, notifier: IAccountCreatedNotifier, options?: ICreateUserOptions): Promise<IMutationResponse>;
    /**
     * Updates a user.
     * @param { String } id - id of the entity
     * @param {ICreateUserDetails} details - updted info information
     * @returns {Promise<IMutationResponse>}
     */
    updateUser(id: string, details: ICreateUserDetails, dataRole: IRoleList[]): Promise<IMutationResponse>;
    /**
     * Removes a user.
     * @param { String } id - id of the entity
     * @returns {Promise<IUserDocument>}
     */
    removeUser(id: string): Promise<IMutationResponse>;
    /**
     * Finds the user with the specified username but if more than one user matches the case insensitive search, it returns null.
     * @param {string} username - the username to look for
     * @return {Promise<IUserDocument>}
     */
    findByUsername(username: string): Promise<IUserDocument>;
        /**
     * Finds the user with the specified Full Name but if more than one user matches the case insensitive search, it returns null.
     * @param {string} firstName - the firstName to look for
     * @param {string} lastName - the firstName to look for
     * @return {Promise<IUserDocument>}
     */
    findByFullName(firstName: string, lastName: string): Promise<IUserDocument>;
     /**
     * Finds the user with the specified username but if more than one user matches the case insensitive search, it returns null.
     * @param {string} username - the username to look for
     * @return {Promise<IUserDocument>}
     */
    findUserById(id: string): Promise<IUserDocument>;
    /**
     * Finds the user with the specified email but if more than one user matches the case insensitive search, it returns null.
     * @param {string} email - the email address to look for
     * @returns {Promise<IUserDocument>}
     */
    /**
     * Finds the user with the specified username but if more than one user matches the case insensitive search, it returns null.
     * @param {string} username - the username to look for
     * @return {Promise<IUserDocument>}
     */
    findByEmail(email: string): Promise<IUserDocument>;
    /**
     * Add an email address for a user. Use this instead of directly updating the database.
     * The operation will fail if there is a different user with an email only differing in case.
     * If the specified user has an existing email only differing in case however, we replace it.
     * @param {string} userId - the is of the user to update
     * @param {string} newEmail - email address to be added
     * @param {boolean} verified - (Optional) whether the new email address should be marked as verified. Defaults to false
     * @returns {Promise<IMutationResponse>}
     */
    addEmail(userId: string, newEmail: string, verified?: boolean): Promise<IMutationResponse>;
    /**
     * Remove an email address for a user. Use this instead of updating the database directly.
     * @param {string} userId - the is of the user to update
     * @param {email} email - the email address to remove
     *
     */
    removeEmail(userId: string, email: string): Promise<IMutationResponse>;
    /**
     * Marks the user's email address as verified. Logs the user in afterwards.
     * @param {string} token - the token retrieved from the verification url
     * @returns {Promise<IMutationResponse>}
     */
    verifyEmail(token: string, email: string, expiresIn: string): Promise<IMutationResponse>;
    /**
     * Change the current user's password.
     * @param {string} userId - the is of the user to update
     * @param {string} currentPassword - The user's current password
     * @param {string} newPassword - The new password for the user
     * @returns {Promise<IMutationResponse>}
     */
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<IMutationResponse>;
    /**
     * Request a forgot password email.
     * @param {string} email - user's email address
     * @returns {Promise<nodemailer.SentMessageInfo>}
     */
    forgotPassword(email: string, usernameField: string, notifier: IForgotPasswordNotifier): Promise<nodemailer.SentMessageInfo>;
    /**
     * Reset the password for a user using a token received in email. Logs the user in afterwards.
     * @param {string} token - the token retrieved from the reset passowrd url
     * @param {string} newPassword - the new password for the user
     * @param {boolean} logoutOtherSessions - (Optional) Logout other sessions for this user. (default: true)
     * @returns {Promise<IMutationResponse>}
     */
    resetPassword(token: string, newPassword: string, profile?: IUserProfile, enrollment?: boolean, logoutOtherSessions?: boolean): Promise<IMutationResponse>;
    /**
     * Forcibly change the password for a user.
     * @param {string} userId - the id of the user to update
     * @param {string} password - The new password for the user
     * @returns {Promise<IMutationResponse>}
     */
    setPassword(userId: string, password: string): Promise<IMutationResponse>;
    /**
     * Send an email with a link the user can use to set their initial password.
     * @param {string} userId - the id of the user we need to send the email to
     * @param {string} email - (Optional) the email of the user to be used to send the enrollment link
     * @returns {Promise<nodemailer.SentMessageInfo>}
     */
    sendEnrollmentEmail(userId: string, notifier: IEnrollmentNotifier, email?: string): Promise<nodemailer.SentMessageInfo>;
    /**
     * Send an email with a link the user can use verify their email address.
     * @param {string} userId - the id of the user we need to send the email to
     * @param {string} email - (Optional) the email of the user to be used to send the verification link
     * @returns {Promise<nodemailer.SentMessageInfo>}
     */
    sendVerificationEmail(userId: string, notifier: IEmailNotifier, email?: string): Promise<nodemailer.SentMessageInfo>;
    /**
     * Checks if a reset password token is valid
     */
    verifyResetPasswordToken(token: string, expiresIn: string): Promise<boolean>;
     /**
     * Checks if a enrollment token is valid
     */
    verifyEnrollmentToken(token: string, expiresIn: string): Promise<boolean>;
    /**
     * Search system users using paging
     */
    search(details: IPaginationDetails): Promise<IPagedQueryResult<IUserDocument>>;
     /**
     * Finds the user with the specified identity
     * @param {IIdentity} identity - the Identity taken from the request
     * @return {Promise<IUserDocument>}
     */
    findByIdentity(identity: IIdentity): Promise<IUserDocument>;
    /**
     * Find all users
     */
    findAllUsers(filter: string): Promise<IUserDocument[]>;
    /**
     * Adds a new mobile device to a user
     */
    addMobileDevice(id: string, info: IMobileDevice): Promise<boolean>;
    /**
     * Remove a mobile device from a user
     */
    removeMobileDevice(network: string, deviceToken: string): Promise<boolean>;
    /**
     * find users with array of user ids
     */
    findUsersById(id: string[]): Promise<IUserDocument[]>;
    /**
     * update the user's preferences
     */
    updateUserPreference(id: string, input: IUserPreference): Promise<IUserDocument>;

    /**
     * Edit user profile by Yojanier
     */
    editUserProfile(id: string, input: IUserProfileInput): Promise<IMutationResponse>;

    /**
     * Find user profile by Id made by yojanier
     */
    userProfileById(id: string): Promise<IUserProfileResolve>;

    /**
     * add/update avatar address
     */
    updateUserAvatarAddress(id: string, avatarAddress: string): Promise<IMutationResponse>;

    /**
     * get Avatar address
     */
    getUserAvatarAddress(id: string): Promise<string>;
}
