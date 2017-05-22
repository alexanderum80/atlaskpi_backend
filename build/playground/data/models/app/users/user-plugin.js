"use strict";
var moment = require("moment");
var Promise = require("bluebird");
var ms = require("ms");
var logger = require("winston");
var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var validate = require("validate.js");
var utils_1 = require("../../../../lib/utils");
var _1 = require("../../");
var config_1 = require("../../../../config");
function accountPlugin(schema, options) {
    options || (options = {});
    var Schema = mongoose.Schema;
    var EmailSchema = new Schema({
        address: { type: String, required: true },
        verified: Boolean
    });
    var EmailedTokenSchema = new Schema({
        token: { type: String, required: true },
        email: { type: String, required: true },
        when: { type: Date, required: true }
    });
    var ServicesSchema = new Schema({
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
    var UserProfileSchema = new Schema({
        firstName: { type: String, required: true },
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
    var SALT_WORK_FACTOR = 10;
    schema.pre('save', function (next) {
        var user = this;
        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password'))
            return next();
        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err)
                return next(err);
            // hash the password using our new salt
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err)
                    return next(err);
                // override the cleartext password with the hashed one
                user.password = hash;
                next();
            });
        });
    });
    /**
     *   INSTANCE METHODS
     */
    schema.methods.comparePassword = function (candidatePassword) {
        return bcrypt.compareSync(candidatePassword, this.password);
    };
    schema.methods.hasEmail = function (email) {
        // make sure the specified email belongs to this user
        return this.emails.some(function (userEmail) {
            return userEmail.address === email;
        });
    };
    schema.methods.addResetPasswordToken = function (email) {
        this.services = this.services || {};
        this.services.password = this.services.password || {};
        this.services.password.reset = {
            email: email,
            token: utils_1.generateUniqueHash(),
            when: moment.utc().toDate()
        };
    };
    schema.methods.addEnrollmentEmail = function (email) {
        // add the enrollment email token
        this.services = this.services || {};
        this.services.email = this.services.email || {};
        this.services.email.enrollment = this.services.email.enrollment || [];
        this.services.email.enrollment.push({
            email: email,
            token: utils_1.generateUniqueHash(),
            when: moment.utc().toDate()
        });
    };
    /**
     *    STATIC METHODS
     */
    schema.statics.authenticate = function (username, password) {
        var User = this;
        return new Promise(function (resolve, reject) {
            var condition = {};
            var usernameField = config_1.config.usersService.usernameField;
            if (usernameField === 'email') {
                condition['emails.address'] = username;
            }
            else {
                condition['username'] = username;
            }
            User.findOne(condition)
                .populate('roles')
                .then(function (user) {
                if (!user) {
                    reject({ name: 'notfound', message: 'User not found' });
                }
                if (user.comparePassword(password)) {
                    resolve(user);
                }
                else {
                    reject({ name: 'invalidCredentials', message: 'Invalid Credentials' });
                }
            })["catch"](function (reason) { reject(reason); });
        });
    };
    var defaultCreateUserOptions = {
        notifyUser: true,
        emailVerified: false
    };
    schema.statics.createUser = function (data, notifier, options) {
        // deambiguation (when seed method used data is a simple object!!!
        if (data.data !== undefined) {
            data = data.data;
        }
        ;
        var that = this;
        var opts = Object.assign({}, defaultCreateUserOptions, options);
        return new Promise(function (resolve, reject) {
            var constraints = {
                firstName: { presence: { message: '^cannot be blank' } },
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
            var validation = validate.async(data, constraints, { fullMessages: false })
                .then(function () {
                var newUser = {
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
                else if (!opts.emailVerified) {
                    var hash = utils_1.generateUniqueHash();
                    newUser.services = {
                        email: {
                            verificationTokens: [{
                                    token: hash,
                                    email: data.email,
                                    when: moment.utc().toDate()
                                }]
                        }
                    };
                }
                that.create(newUser, function (err, user) {
                    if (err) {
                        reject({ message: 'There was an error creating the user', error: err });
                        return;
                    }
                    // add user roles
                    if (data.roles && data.roles.length > 0) {
                        data.roles.forEach(function (role) {
                            user.addRole(role, function (err, role) {
                                if (err) {
                                    logger.error('Error adding role: ', err);
                                }
                            });
                        });
                    }
                    // send email to user
                    if (opts.notifyUser) {
                        notifier.notify(user, data.email);
                    }
                    resolve({ entity: user });
                });
            }, function (err) {
                resolve(_1.MutationResponse.fromValidationErrors(err));
            });
        });
    };
    schema.statics.updateUser = function (id, data) {
        var _this = this;
        var that = this;
        return new Promise(function (resolve, reject) {
            var idError = validate({ id: id }, { id: { presence: { message: '^cannot be blank' } } });
            if (idError) {
                resolve(_1.MutationResponse.fromValidationErrors(idError));
                return;
            }
            var whiteList = {
                firstName: true,
                lastName: true,
                middleName: true,
                password: true,
                roles: true
            };
            validate.cleanAttributes(data, whiteList);
            var constraints = {
                firstName: { presence: { message: '^cannot be blank' } }
            };
            var dataError = validate(data, constraints, { fullMessages: false });
            if (dataError) {
                resolve(_1.MutationResponse.fromValidationErrors(dataError));
                return;
            }
            _this.findById(id).then(function (user) {
                var documentError = validate({ user: user }, { user: { presence: { message: '^not found' } } }, { fullMessages: false });
                if (documentError) {
                    resolve(_1.MutationResponse.fromValidationErrors(documentError));
                    return;
                }
                if (data.firstName) {
                    user.profile.firstName = data.firstName;
                }
                ;
                if (data.lastName) {
                    user.profile.lastName = data.lastName;
                }
                ;
                if (data.middleName) {
                    user.profile.middleName = data.middleName;
                }
                ;
                if (data.password) {
                    user.password = data.password;
                }
                ;
                // add user roles
                if (data.roles && data.roles.length > 0) {
                    user.roles = [];
                    data.roles.forEach(function (role) {
                        user.addRole(role, function (err, role) {
                            if (err) {
                                logger.error('Error adding role: ', err);
                            }
                        });
                    });
                }
                ;
                user.save(function (err, user) {
                    if (err) {
                        reject({ message: 'There was an error updating the user', error: err });
                        return;
                    }
                    resolve({ entity: user });
                });
            })["catch"](function (err) {
                resolve(_1.MutationResponse.fromValidationErrors({ success: false, reason: err }));
            });
        });
    };
    schema.statics.removeUser = function (id) {
        var _this = this;
        var that = this;
        var document;
        return new Promise(function (resolve, reject) {
            var idError = validate({ id: id }, { id: { presence: { message: '^cannot be blank' } } });
            if (idError) {
                resolve(_1.MutationResponse.fromValidationErrors(idError));
            }
            _this.findById(id).then(function (user) {
                var constraints = {
                    document: { presence: { message: '^not found' } }
                };
                var errors = validate({ id: id, document: user }, constraints, { fullMessages: false });
                if (errors) {
                    resolve(_1.MutationResponse.fromValidationErrors(errors));
                }
                var deletedUser = user;
                user.remove(function (err, user) {
                    if (err) {
                        reject({ message: 'There was an error removing the user', error: err });
                        return;
                    }
                    resolve({ entity: deletedUser });
                });
            });
        });
    };
    schema.statics.findByUsername = function (username) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.findOne({ username: username }).then(function (user) {
                if (user) {
                    resolve(user);
                }
                else {
                    reject(null);
                }
            })["catch"](function () {
                reject(null);
            });
        });
    };
    schema.statics.findByEmail = function (email) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.findOne({ 'emails.address': email }).then(function (user) {
                if (user) {
                    resolve(user);
                }
                else {
                    reject(null);
                }
            })["catch"](function () {
                reject(null);
            });
        });
    };
    schema.statics.findUserById = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.findOne({ '_id': id })
                .populate('roles', '-_id, name')
                .then(function (user) {
                if (user) {
                    resolve({ errors: null, data: user });
                }
                else {
                    resolve({ errors: [{ field: 'user', errors: ['Not found'] }], data: null });
                }
            })["catch"](function () {
                resolve({ errors: [{ field: 'user', errors: ['Not found'] }], data: null });
            });
        });
    };
    schema.statics.addEmail = function (userId, newEmail, verified) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            verified = verified || false;
            _this.findOne({ 'emails.address': newEmail }).then(function (user) {
                if (user) {
                    console.dir(user._id);
                    if (user._id.toString().toLowerCase() !== userId.toLowerCase()) {
                        console.log('different user');
                        throw ({ name: 'duplicated', message: 'Another user is using this email address' });
                    }
                    else {
                        console.log('same user');
                        throw ({ name: 'exist', message: 'This email was already assigned to this user' });
                    }
                }
                else {
                    console.log('adding user');
                    _this.update({
                        _id: userId
                    }, {
                        $push: {
                            'emails': {
                                address: newEmail,
                                verified: verified
                            }
                        }
                    }).then(function () {
                        resolve({ success: true });
                    }, function (err) {
                        reject({ success: false, reason: err });
                    });
                }
            })["catch"](function (err) {
                reject({ success: false, reason: err });
            });
        });
    };
    schema.statics.removeEmail = function (userId, email) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.update({
                _id: userId
            }, {
                $pull: {
                    emails: { address: email }
                }
            }).then(function () {
                resolve({ success: true });
            }, function (err) {
                reject({ success: true, reason: err });
            });
        });
    };
    schema.statics.verifyEmail = function (token, email) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // retireve user with this token
            _this.findOne({ 'services.email.verificationTokens.token': token })
                .then(function (user) {
                if (!user) {
                    reject({ success: false, reason: 'Token not found' });
                    return;
                }
                // check the expiration
                var verificationToken = user.services.email.verificationTokens.find(function (emailToken) {
                    return emailToken.token === token;
                });
                var expiration = moment(verificationToken.when)
                    .add('minute', config_1.config.usersService.services.verifyEmail.expiresIn);
                if (moment().isAfter(expiration)) {
                    reject({ success: false, reason: { name: 'expired', message: 'Token expired' } });
                    return;
                }
                // mark email as verified
                var emailToVerify = user.emails.find(function (userEmail) {
                    return userEmail.address === email;
                });
                emailToVerify.verified = true;
                // remove verification token
                verificationToken.remove();
                // save user
                user.save(function (err, affected) {
                    if (err) {
                        reject({ success: false, reason: err });
                        return;
                    }
                    resolve({ success: true });
                });
            }, function (err) {
                reject({ sucess: false, reason: err });
            });
        });
    };
    schema.statics.changePassword = function (userId, currentPassword, newPassword) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.findById(userId).then(function (user) {
                if (!user) {
                    reject({ success: false, reason: { name: 'not found', message: 'User not found' } });
                    return;
                }
                var passwordMatch = user.comparePassword(currentPassword);
                if (!passwordMatch) {
                    reject({ success: false, reason: {
                            name: 'invalidPassword',
                            message: 'The current password is invalid'
                        }
                    });
                    return;
                }
                // current password is correct so we can proceed to change the password
                user.password = newPassword;
                user.save(function (err, user) {
                    if (err) {
                        reject({ success: false, reason: err });
                        return;
                    }
                    resolve({ success: true });
                });
            }, function (err) {
                reject({ success: false, reason: err });
            });
        });
    };
    schema.statics.forgotPassword = function (email, notifier) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.findOne({ 'emails.address': email }).then(function (user) {
                if (!user) {
                    reject({ name: 'notfound', message: 'Account not found' });
                    return;
                }
                // add the reset password token to the user
                user.addResetPasswordToken(email);
                user.save().then(function (user) {
                    notifier.notify(user, email).then(function (sentEmailInfo) {
                        resolve(sentEmailInfo);
                    }, function (err) {
                        throw { name: 'email', message: err.message };
                    });
                }, function (err) {
                    reject({ message: 'Reset password token could not be generated', error: err });
                });
            });
        });
    };
    schema.statics.resetPassword = function (token, newPassword, logoutOtherSessions) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.findOne({ 'services.password.reset.token': token })
                .then(function (user) {
                if (!user) {
                    reject({ success: false, reason: { name: 'notfound', message: 'Token not found' } });
                    return;
                }
                user.password = newPassword;
                user.services.password.reset.remove();
                user.save().then(function (user) {
                    resolve({ success: true });
                }, function (err) {
                    reject({ success: false, reason: err });
                });
            }, function (err) {
                reject({ success: false, reason: err });
            });
        });
    };
    schema.statics.setPassword = function (userId, password) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.findById(userId)
                .then(function (user) {
                if (!user) {
                    reject({ success: false, reason: { name: 'notfound', message: 'User not found' } });
                }
                user.password = password;
                user.save().then(function (user) {
                    resolve({ success: true });
                }, function (err) {
                    reject({ success: false, reason: err });
                });
            }, function (err) {
                reject({ success: false, reason: err });
            });
        });
    };
    schema.statics.sendEnrollmentEmail = function (userId, notifier, email) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.findById(userId).then(function (user) {
                if (!user) {
                    throw ({ name: 'notfound', message: 'User not found' });
                }
                // use the email address from the parameters or the first user email
                email = email || user.emails[0].address;
                if (!user.hasEmail(email)) {
                    reject({ success: false, reason: { name: 'notfound', message: 'Email not found' } });
                    return;
                }
                // add the enrollment email token
                user.addEnrollmentEmail(email);
                user.save().then(function (user) {
                    notifier.notify(user, email).then(function (sentEmailInfo) {
                        resolve(sentEmailInfo);
                    }, function (err) {
                        throw { name: 'email', message: err.message };
                    });
                }, function (err) {
                    reject({ message: 'There was a problem sending enrollment email', error: err });
                });
            }, function (err) {
                reject(err);
            });
        });
    };
    schema.statics.sendVerificationEmail = function (userId, notifier, email) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.findById(userId).then(function (user) {
                if (!user) {
                    throw ({ name: 'notfound', message: 'User not found' });
                }
                // use the email address from the parameters or the first user email
                email = email || user.emails[0].address;
                if (!user.hasEmail(email)) {
                    reject({ success: false, reason: { name: 'notfound', message: 'Email not found' } });
                    return;
                }
                notifier.notify(user, email).then(function (sentEmailInfo) {
                    resolve(sentEmailInfo);
                }, function (err) {
                    throw { name: 'email', message: err.message };
                });
            });
        });
    };
    schema.statics.verifyResetPasswordToken = function (token) {
        var defer = Promise.defer();
        this.findOne({ 'services.password.reset.token': token }).then(function (user) {
            if (!user) {
                defer.resolve({ isValid: false });
            }
            var expirationDate = moment(user.services.password.reset.when)
                .add('milliseconds', ms(config_1.config.usersService.services.forgotPassword.expiresIn));
            if (moment().isAfter(expirationDate)) {
                // remove token because it is not useful any way
                user.services.password.reset.remove();
                user.save();
                defer.resolve({ isValid: false });
            }
            defer.resolve({ isValid: true });
        }, function (err) {
            defer.resolve({ isValid: false });
        });
        return defer.promise;
    };
    schema.statics.search = function (details) {
        var paginator = new _1.Paginator(this, ['profile.firstName', 'profile.middleName', 'profile.lastName']);
        return paginator.getPage(details);
    };
}
exports.accountPlugin = accountPlugin;
//# sourceMappingURL=user-plugin.js.map