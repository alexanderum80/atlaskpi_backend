"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var __1 = require("../..");
var models_1 = require("../../../models");
var users_1 = require("../../../../services/notifications/users");
var config_1 = require("../../../../config");
var validate = require("validate.js");
var winston = require("winston");
var rbac_1 = require("../../../../lib/rbac");
var rolesSetup = require("./initialRoles");
var changeCase = require("change-case");
var utils_1 = require("../../../../lib/utils");
var controllers_1 = require("../../../../controllers");
var seed_app_1 = require("../../../seed/app/seed-app");
// define mongo schema
var accountSchema = new mongoose.Schema({
    name: { type: String, index: true, required: true },
    personalInfo: {
        fullname: String,
        email: { type: String, index: true, required: true }
    },
    businessInfo: {
        numberOfLocations: Number,
        country: String,
        phoneNumber: String
    },
    database: {
        url: String,
        name: String
    },
    audit: {
        createdOn: { type: Date, "default": Date.now },
        updatedOn: { type: Date, "default": Date.now }
    }
});
// static methods
accountSchema.statics.createNewAccount = function (account) {
    var that = this;
    return new Promise(function (resolve, reject) {
        var constrains = {
            name: { presence: { message: '^cannot be blank' } },
            personalInfo: { presence: { message: '^cannot be blank' } },
            businessUnits: { presence: { message: '^cannot be blank' } }
        };
        var validationErrors = validate(account, constrains, { fullMessages: false });
        if (validationErrors) {
            resolve(__1.MutationResponse.fromValidationErrors(validationErrors));
            return;
        }
        ;
        account.database = generateDBObject(account.name);
        that.create(account, function (err, newAccount) {
            if (err) {
                resolve({ errors: [{ field: 'account', errors: [err.message] }], entity: null });
                return;
            }
            var hash = utils_1.generateUniqueHash();
            var firstUser = { email: account.personalInfo.email,
                password: hash.substr(hash.length - 10, hash.length) };
            models_1.getContext(newAccount.database.url + "/" + newAccount.database.name).then(function (newAccountContext) {
                newAccountContext.Role.find({}).then(function (roles) {
                    rbac_1.initRoles(newAccountContext, rolesSetup.initialRoles, function (err, admin, readonly) {
                        console.log(admin);
                        console.log(readonly);
                    });
                })
                    .then(function (rolesCreated) {
                    var notifier = new users_1.EnrollmentNotification(config_1.config, { hostname: newAccount.database.name });
                    newAccountContext.User.createUser(firstUser, notifier).then(function (response) {
                        response.entity.addRole('admin');
                        Promise.map(account.businessUnits, function (businessUnit) {
                            return newAccountContext.BusinessUnit.create(businessUnit);
                        })
                            .then(function () {
                            if (account.seedData) {
                                seed_app_1.seedApp(newAccountContext);
                            }
                            return Promise.resolve();
                        })
                            .then(function () {
                            var subdomain = account.database.name + ".kpibi.com:4200";
                            var auth = new controllers_1.AuthController(that, newAccountContext);
                            auth.authenticateUser(subdomain, firstUser.email, firstUser.password)
                                .then(function (tokenInfo) {
                                newAccount.subdomain = subdomain;
                                newAccount.initialToken = tokenInfo;
                                resolve({ entity: newAccount });
                            });
                        });
                    }, function (err) {
                        winston.error('Error creating user: ', err);
                    });
                })["catch"](function (err) {
                    resolve({ errors: [{ field: 'account', errors: [err.message] }], entity: null });
                });
            });
        });
    });
};
accountSchema.statics.findAccountByUsername = function (username) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.find({ 'profileInfo.email': username }).sort('-_id').limit(1).exec(function (err, account) {
            if (account) {
                resolve(account);
            }
            else {
                throw { code: 404, message: 'Account not found' };
            }
        });
    });
};
accountSchema.statics.findAccountByHostname = function (hostname) {
    var that = this;
    return new Promise(function (resolve, reject) {
        // let hostnameTokens = hostname.split('.');
        // // make sure the hotsname is in this format: subdomain.domain.com
        // if (hostnameTokens.length !== 3) {
        //     reject('Invalid hostname');
        // }
        var name = '';
        if (hostname.indexOf('.') >= 0) {
            name = hostname.split('.')[0];
        }
        else {
            name = hostname;
        }
        ;
        that.findOne({ 'database.name': name }, function (err, account) {
            if (err) {
                reject(err);
                return;
            }
            if (account) {
                resolve(account);
            }
            else {
                throw { code: 404, message: 'Account not found' };
            }
        });
    });
};
accountSchema.statics.accountNameAvailable = function (name) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.findOne({ 'name': { $regex: name, $options: 'i' } }, function (err, account) {
            if (err) {
                reject(err);
                return;
            }
            if (account) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
};
accountSchema.methods.getConnectionString = function () {
    return this.database.url + "/" + this.database.name;
};
function getAccountModel() {
    return mongoose.model('Account', accountSchema);
}
exports.getAccountModel = getAccountModel;
function generateDBObject(databaseName) {
    return { url: 'mongodb://localhost',
        name: changeCase.paramCase(databaseName)
    };
}
exports.generateDBObject = generateDBObject;
;
//# sourceMappingURL=Account.js.map