import { IIdentity } from '../identity';
import { IQueryResponse } from '../../common/query-response';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as nodemailer from 'nodemailer';
import * as Promise from 'bluebird';
import ms = require('ms');
import * as logger from 'winston';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as validate from 'validate.js';
import * as winston from 'winston';
import { generateUniqueHash } from '../../../../lib/utils';
import {
    IEmailNotifier,
    IAccountCreatedNotifier,
    IEnrollmentNotifier,
    IForgotPasswordNotifier,
    AccountCreatedNotification
} from '../../../../services';
import {
    ICreateUserDetails,
    ICreateUserOptions,
    ITokenVerification,
    IUser,
    IUserDocument,
    IUserEmailedToken,
    IUserModel,
    IMutationResponse,
    MutationResponse,
    IPaginationDetails,
    IPagedQueryResult,
    Paginator
} from '../../';
import { config } from '../../../../config';
import { IErrorData } from '../..';

export function accountPlugin(schema: mongoose.Schema, options: any) {
    options || (options = {});

    let Schema = mongoose.Schema;

    let EmailSchema = new Schema({
        address: { type: String, required: true },
        verified: Boolean
    });

    let EmailedTokenSchema = new Schema({
        token: { type: String, required: true },
        email: { type: String, required: true },
        when: { type: Date, required: true }
    });

    let ServicesSchema = new Schema({
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
    });

    let UserProfileSchema = new Schema({
        firstName: String,
        middleName: String,
        lastName: String,
        sex: String,
        dob: Date
    });

    schema.add({
        emails: [{
            address: { type: String, required: true },
            verified: { type: Boolean, required: true }
        }],
        username: {
            type: String,
            required: false
        },
        password: String,
        services: ServicesSchema,
        profile: UserProfileSchema
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

    /**
     *    STATIC METHODS
     */

    schema.statics.authenticate = function(username: string, password: string): Promise<IUserDocument> {
        let User: IUserModel = this;

        return new Promise<IUserDocument>((resolve, reject) => {
            let condition = {};
            let usernameField = config.usersService.usernameField;

            if (usernameField === 'email') {
                condition['emails.address'] = username;
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
                            notifier.notify(user, data.email);
                        }

                        resolve({ entity: user });
                    });

                }, (err: { [name: string]: string[] }) => {
                    resolve(MutationResponse.fromValidationErrors(err));
                });
        });
    };

    schema.statics.updateUser = function(id: string, data: ICreateUserDetails): Promise<IMutationResponse> {
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

                if (data.firstName) { user.profile.firstName = data.firstName; };
                if (data.lastName) { user.profile.lastName = data.lastName; };
                if (data.middleName) { user.profile.middleName = data.middleName; };
                if (data.password) { user.password = data.password; };

                // add user roles
                if (data.roles && data.roles.length > 0) {
                    user.roles = [];
                    data.roles.forEach((role) => {
                        user.addRole(role, (err, role) => {
                            if (err) {
                                logger.error('Error adding role: ', err);
                            }
                        });
                    });
                };

                user.save( (err, user: IUser) => {
                    if (err) {
                        reject({ message: 'There was an error updating the user', error: err });
                        return;
                    }
                    resolve({ entity: user });
                });
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

    schema.statics.findByEmail = function(email: string): Promise<IUserDocument> {
        return new Promise<IUserDocument>((resolve, reject) => {
            (<IUserModel>this).findOne({ 'emails.address': email }).then((user) => {
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

    schema.statics.findUserById = function(id: string): Promise<IQueryResponse<IUserDocument>> {
        return new Promise<IQueryResponse<IUserDocument>>((resolve, reject) => {
            (<IUserModel>this).findOne({ '_id': id })
                .populate('roles', '-_id, name' )
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

    schema.statics.verifyEmail = function(token: string, email: string): Promise<IMutationResponse> {
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
                        .add('minute', config.usersService.services.verifyEmail.expiresIn);

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

    schema.statics.forgotPassword = function(email: string, notifier: IForgotPasswordNotifier): Promise<nodemailer.SentMessageInfo> {
        return new Promise<nodemailer.SentMessageInfo>((resolve, reject) => {
            mongoose.set('debug', true);
            (<IUserModel>this).findOne({ 'emails.address': email }).then((user) => {
                if (!user) {
                    reject({ name: 'notfound', message: 'Account not found' });
                    return;
                }

                // add the reset password token to the user
                user.addResetPasswordToken(email);

                user.save().then((user) => {
                    notifier.notify(user, email, ).then((sentEmailInfo) => {
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

    schema.statics.resetPassword = function(token: string, newPassword: string, enrollment = false, logoutOtherSessions?: boolean): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            let query: any;

            if (!enrollment) {
                query = { 'services.password.reset.token': token };
            } else {
                query = { 'services.email.enrollment': { $elemMatch: { 'token': token} } };
            };

            (<IUserModel>this).findOne(query)
                .then((user) => {
                    if (!user) {
                        reject({ success: false, reason: { name: 'notfound', message: 'Token not found' } });
                        return;
                    }

                    user.password = newPassword;

                    if (!enrollment) {
                        user.services.password.reset.remove();
                    } else {
                        user.services.email.enrollment = [];
                    };

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

    schema.statics.verifyResetasswordToken = function(token: string): Promise<ITokenVerification> {
        let defer = Promise.defer<ITokenVerification>();

        (<IUserModel>this).findOne({ 'services.password.reset.token': token }).then((user) => {
            if (!user) {
                defer.resolve({ isValid: false});
            }

            let expirationDate = moment(user.services.password.reset.when)
                .add('milliseconds', ms(String(config.usersService.services.forgotPassword.expiresIn)));

            if (moment().isAfter(expirationDate)) {
                // remove token because it is not useful any way
                user.services.password.reset.remove();
                user.save();

                defer.resolve({ isValid: false});
            }

            defer.resolve({ isValid: true });
        }, (err) => {
            defer.resolve({ isValid: false });
        });

        return defer.promise;
    };

    schema.statics.verifyEnrollmentToken = function(token: string): Promise<ITokenVerification> {
        let defer = Promise.defer<ITokenVerification>();

        (<IUserModel>this).findOne({ 'services.email.enrollment': { $elemMatch: { 'token': token} } }).then((user) => {
            if (!user) {
                defer.resolve({ isValid: false});
            }

            let expirationDate = moment(user.services.email.enrollment[0].when)
                .add('milliseconds', ms(String(config.usersService.services.forgotPassword.expiresIn)));

            if (moment().isAfter(expirationDate)) {
                // remove token because it is not useful any way
                user.services.email.enrollment[0].remove();
                user.save();

                defer.resolve({ isValid: false});
            }

            defer.resolve({ isValid: true });
        }, (err) => {
            defer.resolve({ isValid: false });
        });

        return defer.promise;
    };

    schema.statics.search = function(details: IPaginationDetails): Promise<IPagedQueryResult<IUserDocument>> {
        let paginator = new Paginator<IUserDocument>(this, ['username', 'profile.firstName', 'profile.middleName', 'profile.lastName']);
        return paginator.getPage(details);
    };

    schema.statics.findByIdentity = function(identity: IIdentity): Promise<IUserDocument> {
        return new Promise<IUserDocument>((resolve, reject) => {
            (<IUserModel>this).findOne({ 'username': identity.username })
                .populate('roles', '-_id, name' )
                .populate('services', '-id')
                .then((user) => {
                if (user) {
                    resolve(user);
                } else {
                    resolve(null);
                }
            }).catch(() => {
                resolve(null);
            });
        });
    };

}