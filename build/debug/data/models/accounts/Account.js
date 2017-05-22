"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
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
    return this.create(account, function (err) {
        console.error(err);
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
;
//# sourceMappingURL=Account.js.map