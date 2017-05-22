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
            personalInfo: { presence: { message: '^cannot be blank' } }
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
            var firstUser = { email: account.personalInfo.email,
                password: '1234567890' };
            models_1.getContext(newAccount.database.url + "/" + newAccount.database.name).then(function (newAccountContext) {
                newAccountContext.Role.find({}).then(function (roles) {
                    rbac_1.initRoles(newAccountContext, rolesSetup.initialRoles, function (err, admin, readonly) {
                        console.log(admin);
                        console.log(readonly);
                    });
                }).then(function (rolesCreated) {
                    var notifier = new users_1.AccountCreatedNotification(config_1.config);
                    newAccountContext.User.createUser(firstUser, notifier).then(function (response) {
                        response.entity.addRole('admin');
                    }, function (err) {
                        winston.error('Error creating user: ', err);
                    });
                });
                resolve({ entity: newAccount });
            });
        });
    });
};
accountSchema.statics.findAccountByHostname = function (hostname) {
    var that = this;
    return new Promise(function (resolve, reject) {
        var hostnameTokens = hostname.split('.');
        // make sure the hotsname is in this format: subdomain.domain.com
        if (hostnameTokens.length !== 3) {
            reject('Invalid hostname');
        }
        var name = hostnameTokens[0];
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
accountSchema.methods.getConnectionString = function () {
    return this.database.url + "/" + this.database.name;
};
function getAccountModel() {
    return mongoose.model('Account', accountSchema);
}
exports.getAccountModel = getAccountModel;
function generateDBObject(databaseName) {
    return { url: 'mongodb://localhost',
        name: changeCase.camelCase(databaseName)
    };
}
exports.generateDBObject = generateDBObject;
;
//# sourceMappingURL=Account.js.map