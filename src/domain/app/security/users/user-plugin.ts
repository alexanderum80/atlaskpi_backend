import * as bcrypt from 'bcrypt';
import * as Promise from 'bluebird';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import ms = require('ms');
import * as nodemailer from 'nodemailer';
import * as validate from 'validate.js';
import * as logger from 'winston';

import { User } from '../../../../app_modules/users/users.types';
import { field } from '../../../../framework/decorators/field.decorator';
import { query } from '../../../../framework/decorators/query.decorator';
import { IMutationResponse, MutationResponse } from '../../../../framework/mutations/mutation-response';
import { IPagedQueryResult, IPaginationDetails, Paginator } from '../../../../framework/queries/pagination';
import { IQueryResponse } from '../../../../framework/queries/query-response';
import { generateUniqueHash } from '../../../../helpers/security.helpers';
import { IEmailNotifier } from '../../../../services/notifications/email-notifier';
import { IAccountCreatedNotifier } from '../../../../services/notifications/users/account-created.notification';
import { IEnrollmentNotifier } from '../../../../services/notifications/users/enrollment.notification';
import { IForgotPasswordNotifier } from '../../../../services/notifications/users/user-forgot-password.notification';
import { ICreateUserDetails } from '../../../common/create-user';
import { IIdentity } from './identity';
import { ITokenDetails } from './token-details';
import {
    ICreateUserOptions,
    IMobileDevice,
    ITokenInfo,
    ITokenVerification,
    IUser,
    IUserDocument,
    IUserModel,
    IUserPreference,
    IUserProfile,
} from './user';
import { IUserToken } from './user-token';


export function userPlugin(schema: mongoose.Schema, options: any) {
    options || (options = {});

    const Schema = mongoose.Schema;

    const EmailSchema = {
        address: { type: String, required: true },
        verified: Boolean
    };

    const EmailedTokenSchema = {
        token: { type: String },
        email: { type: String },
        when: { type: Date }
    };

    const ServicesSchema = {
        loginTokens: [{
            when: Date,
            hashedToken: String,
            clientId: String
        }],
        password: {
            reset: EmailedTokenSchema
        },
        email: {
            verificationTokens: [EmailedTokenSchema],
            enrollment: [EmailedTokenSchema]
        }
    };

    const UserProfileSchema = {
        firstName: String,
        middleName: String,
        lastName: String,
        sex: String,
        dob: Date
    };

    const UserTokenInfo = {
        ip: String,
        token: String,
        issued: Date,
        expires: Date,
        clientId: String,
        clientDetails: String
    };

    const AddMobileDeviceInfo = {
        token: String,
        network: String,
        name: String
    };

    const ShowTourSchema = {
        showTour: {
            type: Boolean,
            default: true
        }
    };

    const UserPreferenceSchema = {
        chart: ShowTourSchema
    };

    schema.add({
        emails: [{
            address: { type: String, required: true },
            verified: { type: Boolean, required: true }
        }],
        username: {
            type: String,
            required: false,
            unique: true
        },
        owner: Boolean,
        password: String,
        services: ServicesSchema,
        profile: UserProfileSchema,
        preferences: UserPreferenceSchema,
        tokens: [UserTokenInfo],
        mobileDevices: [AddMobileDeviceInfo],
        timestamps: { type: Date, default: Date.now }
    });

    // encrypt passowrd on save
    const SALT_WORK_FACTOR = 10;

    schema.pre('save', function(next) {
        let user = this;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);

            // hash the password using our new salt
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);

                // override the cleartext password with the hashed one
                user.password = hash;
                next();
            });
        });
    });

    /**
     *   INSTANCE METHODS
     */

    schema.methods.comparePassword = function(candidatePassword): boolean {
        return bcrypt.compareSync(candidatePassword, this.password);
    };

    schema.methods.hasEmail = function(email: string): Boolean {
        // make sure the specified email belongs to this user
        return (<IUserDocument>this).emails.some((userEmail) => {
            return userEmail.address === email;
        });
    };

    schema.methods.addResetPasswordToken = function(email: string): void {
        this.services = this.services || { };
        this.services.password = this.services.password || { };

        this.services.password.reset = {
            email: email,
            token: generateUniqueHash(),
            when: moment.utc().toDate()
        };
    };

    schema.methods.addEnrollmentEmail = function(email: string): void {
         // add the enrollment email token
        this.services = this.services || { };
        this.services.email = this.services.email || { };
        this.services.email.enrollment = this.services.email.enrollment || [];

        this.services.email.enrollment.push({
            email: email,
            token: generateUniqueHash(),
            when: moment.utc().toDate()
        });
    };

    schema.methods.generateToken = function(accountName: string, username: string, password: string, ip: string, clientId: string, clientDetails: string, secret: string, expiresIn: string): Promise<IUserToken> {
        return new Promise<IUserToken>((resolve, reject) => {
            // create user identity
            let identity: IIdentity = {
                accountName: accountName,
                username: this.username,
                firstName: this.profile.firstName,
                middleName: this.profile.middleName,
                lastName: this.profile.lastName,
                roles: this.roles.map((role) => role.name)
            };

            if (clientId === 'workbench') {
                expiresIn = '10 y';
            }

            // generate user token
            let token = jwt.sign(identity, secret, {
                expiresIn: expiresIn
            });

            // create user token response
            let tokenDetails: IUserToken = {
                issued: new Date(),
                expires: moment().add('milliseconds', ms(String(expiresIn))).toDate(),
                access_token: token
            };

            // add token to the list of generated token for this user
            addToken(this, tokenDetails, ip, clientId, clientDetails).then(success => {
                if (success) {
                    resolve(tokenDetails);
                } else {
                    reject('There was an error saving the user token');
                }
            });
        });
    };

    function addToken(user: IUserDocument, tokenDetails: ITokenDetails, ip: string, clientId: string, clientDetails: string): Promise<boolean> {

        return new Promise<boolean>((resolve, reject) => {

            let tokenInfo: ITokenInfo = {
                ip: ip,
                token: tokenDetails.access_token,
                issued: tokenDetails.issued,
                expires: tokenDetails.expires,
                clientId: clientId,
                clientDetails: clientDetails
            };

            user.update({
                $push: { 'tokens': tokenInfo }}, (err, doc) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
        });
    }

    /**
     *    STATIC METHODS
     */

    schema.statics.authenticate = function( username: string, password: string, usernameField: string): Promise<IUserDocument> {
        let User: IUserModel = this;

        return new Promise<IUserDocument>((resolve, reject) => {
            let condition = {};

            if (usernameField === 'email') {
                condition['emails'] = { $elemMatch: { address: username  } };
            } else {
                condition['username'] = username;
            }

            User.findOne(condition)
                .populate('roles')
                .then((user: IUserDocument) => {
                    if (!user) {
                        reject({ name: 'notfound', message: 'User not found' });
                    }

                    if (user.comparePassword(password)) {
                        resolve(user);
                    } else {
                        reject({ name: 'invalidCredentials', message: 'Invalid Credentials' });
                    }
                })
                .catch((reason) => { reject(reason); });
        });

    };

    const defaultCreateUserOptions: ICreateUserOptions = {
        notifyUser: true,
        emailVerified: false
    };

    // TODO: this method should only case about the creation of the account, nothing else. This process should be moved to a user service class
    schema.statics.createUser = function(data: ICreateUserDetails, notifier: IAccountCreatedNotifier, options?: ICreateUserOptions): Promise<IMutationResponse> {
        // deambiguation (when seed method used data is a simple object!!!
        if ((<any>data).data !== undefined) { data = (<any>data).data; }

        let that = this;

        let opts = Object.assign({}, defaultCreateUserOptions, options);

        return new Promise<IMutationResponse>((resolve, reject) => {

            let constraints = {
                email: {
                    presence: { message: '^cannot be blank' },
                    email: { message: '^the email address needs to be valid' },
                    checkDuplicateAsync: {
                        model: that,
                        condition: { 'emails.address': data.email },
                        message: 'this email was already registered'
                    }
                }
            };

            let validation = (<any>validate).async(data, constraints, {fullMessages: false})
                .then(() => {

                    that.findByEmail(data.email).then((user: IUserDocument) => {
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

                        let newUser: IUser = {
                            profile: {
                                firstName: data.firstName,
                                middleName: data.middleName,
                                lastName: data.lastName
                            },
                            username: data.username || data.email,
                            emails: [{
                                address: data.email,
                                verified: opts.emailVerified
                            }]
                        };

                        // add password if it was passed
                        if (data.password) {
                            newUser.password = data.password;
                        }
                        // send verification email if it is not verified
                        else if (!opts.emailVerified) {
                            let hash = generateUniqueHash();
                            newUser.services = {
                                email: {
                                    verificationTokens: [{
                                        token: hash,
                                        email: data.email,
                                        when: moment.utc().toDate()
                                    }]
                                },
                            };
                        }

                        that.create(newUser, (err, user: IUserDocument) => {
                            if (err) {
                                reject({ message: 'There was an error creating the user', error: err });
                                return;
                            }

                            // add user roles
                            if (data.roles && data.roles.length > 0) {
                                data.roles.forEach((role) => {
                                    user.addRole(role, (err, role) => {
                                        if (err) {
                                            logger.error('Error adding role: ', err);
                                        }
                                    });
                                });
                            }

                            // add enrollment email
                            user.addEnrollmentEmail(data.email);

                            // send email to user
                            if (opts.notifyUser) {
                                if (options && options.host) {
                                    notifier.notify(user, data.email, options.host);
                                } else {
                                    notifier.notify(user, data.email);
                                }
                            }

                            resolve({ entity: user });
                        });
                    }).catch(err => reject(err));

                }, (err: { [name: string]: string[] }) => {
                    resolve(MutationResponse.fromValidationErrors(err));
                });
        });
    };

    function addRole(data, user) {
        if (data.roles) {
            user.roles = [];
            data.roles.forEach((role) => {
                user.addRole(role, (err, role) => {
                    if (err) {
                        logger.error('Error adding role: ', err);
                    }
                });
            });
        }
    }
    schema.statics.updateUser = function(id: string, data: ICreateUserDetails, dataRoles: any): Promise<IMutationResponse> {
        let that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {

            let idError = (<any>validate)({id: id}, {id: { presence: { message: '^cannot be blank' } } });

            if (idError) {
                resolve(MutationResponse.fromValidationErrors(idError));
                return;
            }

            let whiteList = {
                firstName: true,
                lastName: true,
                middleName: true,
                password: true,
                roles: true
            };

            (<any>validate).cleanAttributes(data, whiteList);

            let constraints = {
                firstName: { presence: { message: '^cannot be blank' } },
            };

            let dataError = (<any>validate)(data, constraints, {fullMessages: false});

            if (dataError) {
                resolve(MutationResponse.fromValidationErrors(dataError));
                return;
            }

            (<IUserModel>this).findById(id).then((user) => {
              let documentError = (<any>validate)( { user: user }, { user: { presence: { message: '^not found' }}},
                                                   { fullMessages: false });

                if (documentError) {
                  resolve(MutationResponse.fromValidationErrors(documentError));
                  return;
                }

                if (data.firstName) {
                    user.profile.firstName = data.firstName; }
                if (data.lastName) {
                    user.profile.lastName = data.lastName; }
                if (data.middleName) { user.profile.middleName = data.middleName; }
                if (data.password) { user.password = data.password; }
                if (data.email) {
                    user.emails[0].address = data.email;
                    user.username = data.email;
                }

                if (data.roles) {
                    user.roles = [];
                    let roles = dataRoles.filter((val) => {
                        if (data.roles.indexOf(val.name) !== -1) {
                            return val;
                        }
                    });
                    roles.forEach((r) => {
                        user.roles.push(r._id);
                    });

                    user.save((err, user: IUser) => {
                        if (err) {
                            reject({ message: 'There was an error updating the user', error: err });
                            return;
                        }
                        resolve({entity: user});
                    });
                }

            }).catch((err) => {
               resolve(MutationResponse.fromValidationErrors({ success: false, reason: err }));
        });
        });

    };

    schema.statics.removeUser = function(id: string): Promise<IMutationResponse> {
        let that = this;

        let document: IUserDocument;

        return new Promise<IMutationResponse>((resolve, reject) => {

            let idError = (<any>validate)({ id: id },
            { id: { presence: { message: '^cannot be blank' } } });

            if (idError) {
                resolve(MutationResponse.fromValidationErrors(idError));
            }

            (<IUserModel>this).findById(id).then((user) => {
                let constraints = {
                    document: { presence: { message: '^not found' }}
                };

                let errors = (<any>validate)({id: id, document: user}, constraints, {fullMessages: false});
                if (errors) {
                    resolve(MutationResponse.fromValidationErrors(errors));
                }

                let deletedUser = user;

                user.remove( (err, user: IUser) => {
                    if (err) {
                        reject({ message: 'There was an error removing the user', error: err });
                        return;
                    }
                    resolve({ entity: deletedUser });
                });
            });
        });

    };

    schema.statics.findByUsername = function(username: string): Promise<IUserDocument> {
        return new Promise<IUserDocument>((resolve, reject) => {
            (<IUserModel>this).findOne({ username: username }).then((user) => {
                if (user) {
                    resolve(user);
                } else {
                    reject(null);
                }
            }).catch(() => {
                reject(null);
            });
        });
    };

    schema.statics.findByFullName = function(firstName: string, lastName: string): Promise<IUserDocument> {
        return new Promise<IUserDocument>((resolve, reject) => {
            (<IUserModel>this).findOne({ 'profile.firstName': firstName, 'profile.lastName': lastName }).then((user) => {
                if (user) {
                    resolve(user);
                } else {
                    reject(null);
                }
            }).catch(() => {
                reject(null);
            });
        });
    };

    schema.statics.findByEmail = function(email: string): Promise<IUserDocument> {
        return new Promise<IUserDocument>((resolve, reject) => {
            const regularExpEmail = new RegExp(email, 'i');

            (<IUserModel>this).findOne({ 'emails.address': regularExpEmail }).then((user) => {
                if (user) {
                    resolve(user);
                } else {
                    resolve(null);
                }
            }).catch(() => {
                reject('uknown error');
            });
        });
    };

    schema.statics.findUserById = function(id: string): Promise<IQueryResponse<IUserDocument>> {
        return new Promise<IQueryResponse<IUserDocument>>((resolve, reject) => {
            (<IUserModel>this).findOne({ '_id': id })
                .populate({
                    path: 'roles',
                    model: 'Role',
                    populate: {
                        path: 'permissions',
                        model: 'Permission'
                    }
                })
                .then((user) => {
                if (user) {
                    resolve({ errors: null, data: user });
                } else {
                    resolve({ errors: [ {field: 'user', errors: ['Not found'] } ], data: null });
                }
            }).catch(() => {
                resolve({ errors: [ {field: 'user', errors: ['Not found'] } ], data: null });
            });
        });
    };

    schema.statics.addEmail = function(userId: string, newEmail: string, verified?: boolean): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {

            verified = verified || false;

            (<IUserModel>this).findOne({ 'emails.address': newEmail }).then((user) => {
                if (user) {
                    console.dir(user._id);
                    if (user._id.toString().toLowerCase() !==  userId.toLowerCase()) {
                        console.log('different user');
                        throw({ name: 'duplicated', message: 'Another user is using this email address' });
                    } else {
                        console.log('same user');
                        throw({ name: 'exist', message: 'This email was already assigned to this user' });
                    }
                } else {
                    console.log('adding user');
                    (<IUserModel>this).update({
                        _id: userId
                    }, {
                        $push: {
                            'emails': {
                                address: newEmail,
                                verified: verified
                            }
                        }
                    }).then(() => {
                        resolve({ success: true });
                    }, (err) => {
                        reject({ success: false, reason: err });
                    });
                }
            }).catch((err) => {
                reject({ success: false, reason: err });
            });
        });
    };

    schema.statics.removeEmail = function(userId: string, email: string): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            (<IUserModel>this).update({
                _id: userId
            }, {
                $pull: {
                    emails: { address: email }
                }
            }).then(() => {
                resolve({ success: true });
            }, (err) => {
                reject({ success: true, reason: err });
            });
        });
    };

    schema.statics.verifyEmail = function(token: string, email: string, expiresIn: string): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            // retireve user with this token
            (<IUserModel>this).findOne({ 'services.email.verificationTokens.token': token })
                .then((user) => {
                    if (!user) {
                        reject({ success: false, reason: 'Token not found' });
                        return;
                    }

                    // check the expiration
                    let verificationToken = user.services.email.verificationTokens.find((emailToken) => {
                        return emailToken.token === token;
                    });

                    let expiration = moment(verificationToken.when)
                        .add('minute', expiresIn);

                    if (moment().isAfter(expiration)) {
                        reject({ success: false, reason: { name: 'expired', message: 'Token expired'} });
                        return;
                    }

                    // mark email as verified
                    let emailToVerify = user.emails.find((userEmail) => {
                        return userEmail.address === email;
                    });

                    emailToVerify.verified = true;

                    // remove verification token
                    (<any>verificationToken).remove();

                    // save user
                    user.save((err, affected) => {
                        if (err) {
                            reject({ success: false, reason: err });
                            return;
                        }

                        resolve({ success: true });
                    });

                }, (err) => {
                    reject({ sucess: false, reason: err });
                });
        });
    };

    schema.statics.changePassword = function(userId: string, currentPassword: string, newPassword: string): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            (<IUserModel>this).findById(userId).then((user) => {
                if (!user) {
                    reject({ success: false, reason: { name: 'not found', message: 'User not found' } });
                    return;
                }

                let passwordMatch = user.comparePassword(currentPassword);

                if (!passwordMatch) {
                    reject({ success: false, reason: {
                        name: 'invalidPassword',
                        message: 'The current password is invalid' }
                    });
                    return;
                }

                // current password is correct so we can proceed to change the password
                user.password = newPassword;
                user.save((err, user) => {
                    if (err) {
                        reject({ success: false, reason: err });
                        return;
                    }

                    resolve({ success: true });
                });
            }, (err) => {
                reject({ success: false, reason: err });
            });
        });
    };

    // TODO: This method should be refactored into a user service
    schema.statics.forgotPassword = function(email: string, usernameField: string, notifier: IForgotPasswordNotifier): Promise<nodemailer.SentMessageInfo> {
        const that = this;
        return new Promise<nodemailer.SentMessageInfo>((resolve, reject) => {
            let condition = {};

            if (usernameField === 'email') {
                condition['emails'] = { $elemMatch: { address: email  } };
            } else {
                condition['username'] = email;
            }

            (<IUserModel>that).findOne(condition).then((user) => {
                if (!user) {
                    reject({ name: 'notfound', message: 'Account not found' });
                    return;
                }

                // add the reset password token to the user
                user.addResetPasswordToken(email);

                user.save().then((user) => {
                    notifier.notify(user, email).then((sentEmailInfo) => {
                        resolve(sentEmailInfo);
                    }, (err) => {
                        throw { name: 'email', message: err.message };
                    });
                }, (err) => {
                    reject({ message: 'Reset password token could not be generated', error: err });
                });
            });
        });
    };

    schema.statics.resetPassword = function(token: string, newPassword: string, profile: IUserProfile, enrollment = false, logoutOtherSessions?: boolean): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            let query: any;

            if (!enrollment) {
                query = { 'services.password.reset.token': token };
            } else {
                query = { 'services.email.enrollment': { $elemMatch: { 'token': token} } };
            }

            (<IUserModel>this).findOne(query)
                .then((user) => {
                    if (!user) {
                        reject({ success: false, reason: { name: 'notfound', message: 'Token not found' } });
                        return;
                    }

                    user.password = newPassword;

                    if (!enrollment) {
                        user.services.password.reset = null;
                    } else {
                        user.services.email.enrollment = [];
                    }

                    if (profile) {
                        user.profile.firstName = profile.firstName;
                        user.profile.lastName = profile.lastName;
                    }

                    user.save().then((user) => {
                        resolve({ success: true });
                    }, (err) => {
                        reject({ success: false, reason: err });
                    });
                }, (err) => {
                    reject({ success: false, reason: err });
                });
        });
    };

    schema.statics.setPassword = function(userId: string, password: string): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            (<IUserModel>this).findById(userId)
                .then((user) => {
                    if (!user) {
                        reject({ success: false, reason: { name: 'notfound', message: 'User not found' } });
                    }

                    user.password = password;

                    user.save().then((user) => {
                        resolve({ success: true });
                    }, (err) => {
                        reject({ success: false, reason: err });
                    });
                }, (err) => {
                    reject({ success: false, reason: err });
                });
        });
    };

    schema.statics.sendEnrollmentEmail = function(userId: string, notifier: IEnrollmentNotifier, email?: string): Promise<nodemailer.SentMessageInfo> {
       return new Promise<nodemailer.SentMessageInfo>((resolve, reject) => {
           (<IUserModel>this).findById(userId).then((user) => {
               if (!user) {
                   throw({ name: 'notfound', message: 'User not found' });
               }

               // use the email address from the parameters or the first user email
                email = email || user.emails[0].address;

                if (!user.hasEmail(email)) {
                    reject({ success: false, reason: { name: 'notfound', message: 'Email not found' } });
                    return;
                }

                // add the enrollment email token
                user.addEnrollmentEmail(email);

                user.save().then((user) => {
                    notifier.notify(user, email).then((sentEmailInfo) => {
                        resolve(sentEmailInfo);
                    }, (err) => {
                        throw { name: 'email', message: err.message };
                    });
                }, (err) => {
                    reject({ message: 'There was a problem sending enrollment email', error: err });
                });

           }, (err) => {
               reject(err);
           });
       });
    };

    schema.statics.sendVerificationEmail = function(userId: string, notifier: IEmailNotifier, email?: string): Promise<nodemailer.SentMessageInfo> {
       return new Promise<nodemailer.SentMessageInfo>((resolve, reject) => {
           (<IUserModel>this).findById(userId).then((user) => {
               if (!user) {
                   throw({ name: 'notfound', message: 'User not found' });
               }

               // use the email address from the parameters or the first user email
                email = email || user.emails[0].address;

                if (!user.hasEmail(email)) {
                    reject({ success: false, reason: { name: 'notfound', message: 'Email not found' } });
                    return;
                }

                notifier.notify(user, email).then((sentEmailInfo) => {
                    resolve(sentEmailInfo);
                }, (err) => {
                    throw { name: 'email', message: err.message };
                });
           });
       });
    };

    schema.statics.verifyResetPasswordToken = function(token: string, expiresIn: string): Promise<ITokenVerification> {
        const that = this;
        return new Promise<ITokenVerification>((resolve, reject) => {
            (<IUserModel>that).findOne({ 'services.password.reset.token': token }).then((user) => {
                if (!user) {
                    resolve({ isValid: false});
                    return;
                }

                let expirationDate = moment(user.services.password.reset.when)
                    .add('milliseconds', ms(String(expiresIn)));

                if (moment().isAfter(expirationDate)) {
                    // remove token because it is not useful any way
                    user.services.password.reset = null;
                    user.save();

                    resolve({ isValid: false});
                    return;
                }
                resolve({ isValid: true });
                return;
            }, (err) => {
                resolve({ isValid: false });
                return;
            });
        });
    };

    schema.statics.verifyEnrollmentToken = function(token: string, expiresIn: string): Promise<ITokenVerification> {
        const that = this;
        return new Promise<ITokenVerification>((resolve, reject) => {
            (<IUserModel>that).findOne({ 'services.email.enrollment': { $elemMatch: { 'token': token} } }).then((user) => {
                if (!user) {
                    resolve({ isValid: false});
                    return;
                }

                let expirationDate = moment(user.services.email.enrollment[0].when)
                    .add('milliseconds', ms(String(expiresIn)));
                if (moment().isAfter(expirationDate)) {
                    // remove token because it is not useful any way
                    user.services.email.enrollment[0].remove();
                    user.save();
                    resolve({ isValid: false});
                    return;
                }

                let verifyResponse = {
                    isValid: true
                };

                if (user.profile && user.profile.hasOwnProperty('firstName') &&
                    user.profile.hasOwnProperty('lastName')) {
                    (<any>verifyResponse).profile = {
                        firstName: user.profile.firstName,
                        lastName: user.profile.lastName
                    };
                }

                resolve(verifyResponse);
                return;
            }, (err) => {
                resolve({ isValid: false });
                return;
            });
        });
    };

    schema.statics.search = function(details: IPaginationDetails): Promise<IPagedQueryResult<IUserDocument>> {
        let paginator = new Paginator<IUserDocument>(this, ['username', 'profile.firstName', 'profile.middleName', 'profile.lastName']);
        return paginator.getPage(details);
    };

    schema.statics.findByIdentity = function(identity: IIdentity): Promise<IUserDocument> {
        return new Promise<IUserDocument>((resolve, reject) => {
            (<IUserModel>this).findOne({ 'username': identity.username })
                .populate({
                    path: 'roles',
                    model: 'Role',
                    populate: {
                        path: 'permissions',
                        model: 'Permission'
                    }
                })
                .then((user) => {
                if (user) {
                    resolve(user);
                } else {
                    resolve(null);
                }
            }).catch((err) => {
                logger.error('Error retrieving the user by the identity: ' + err);
                resolve(err);
            });
        });
    };

    schema.statics.findAllUsers = function(filter: string): Promise<IUserDocument[]> {
        return new Promise<IUserDocument[]>((resolve, reject) => {

            if (filter) {
            (<IUserModel>this).find({username: { $ne: filter } })
                .populate('roles', '-_id, name')
                .then((users) => {
                    if (users) {
                        resolve(users);
                    } else {
                        reject('Roles not found');
                    }
                }).catch((err) => {
                    reject(err);
                });
            } else {
                (<IUserModel>this).find({})
                    .populate('roles', '-_id, name')
                    .then((users) => {
                        if (users) {
                            resolve(users);
                        } else {
                            reject('Roles not found');
                        }
                    }).catch((err) => {
                        reject(err);
                    });
            }
        });
    };

    schema.statics.addMobileDevice = function(id: string, data: { details: IMobileDevice }): Promise<boolean> {
        const that: IUserModel = this;

        return new Promise<boolean>((resolve, reject) => {
            // make sure no one is using the device token we are trying to add for the same network
            that.findOne({ 'mobileDevices.token': data.details.token, 'mobileDevices.network': data.details.network }).then(u => {
                if (u) {
                    return reject('This device was already added to the system');
                }

                // add device
                that.update({ _id: id }, { $push: { mobileDevices: data.details } }).then((res) => {
                    return resolve(true);
                })
                .catch(err => reject(err));
            })
            .catch(err => {
                reject(err);
            });
        });
    };

    schema.statics.removeMobileDevice = function(network: string, token: string): Promise<boolean> {
        const that: IUserModel = this;

        return new Promise<boolean>((resolve, reject) => {
            // make sure no one is using the device token we are trying to add for the same network
            that.findOne({ 'mobileDevices.token': token, 'mobileDevices.network': network }).then(u => {
                if (!u) {
                    return reject('Device not found');
                }

                that.update({ _id: u._id }, { $pull: { mobileDevices: { network: network, token: token } } }).then((res) => {
                    resolve(true);
                })
                .catch(err => reject(err));
            })
            .catch(err => {
                reject(err);
            });
        });
    };

    schema.statics.findUsersById = function(id: string[]): Promise<IUserDocument[]> {
        const UserModel = (<IUserModel>this);
        return new Promise<IUserDocument[]>((resolve, reject) => {
            UserModel.find({ _id: { $in: id } }).then(users => {
                if (users) {
                    resolve(users);
                    return;
                }
                resolve(null);
                return;
            }).catch(err => reject(err));
        });
    };

    schema.statics.updateUserPreference = function(id: string, input: IUserPreference): Promise<IUserDocument> {
        const userModel = (<IUserModel>this);

        return new Promise<IUserDocument>((resolve, reject) => {
            userModel
                .findOneAndUpdate({_id: id}, { preferences: input }, {new: true })
                .exec()
                .then(document => {
                    resolve(document);
                    return;
                })
                .catch(err => {
                    reject(err);
                    return;
                });
        });
    };

}