import mongoose = require('mongoose');
import * as Promise from 'bluebird'
import { IAccountModel, IAccountDocument, IAccount } from './IAccount';

// define mongo schema
let accountSchema = new mongoose.Schema({
    name: { type: String, index: true, required: true },
    personalInfo: {
        fullname: String,
        email: { type: String, index: true, required: true },
    },
    businessInfo: {
        numberOfLocations: Number,
        country: String,
        phoneNumber: String,
    },
    database: {
        url: String,
        name: String,
    },
    audit: {
        createdOn: { type: Date, default: Date.now },
        updatedOn: { type: Date, default: Date.now },
    },
});

// static methods
accountSchema.statics.createNewAccount = function(account: IAccount) {
    return this.create(account, (err) => {
        console.error(err);
    });
};

accountSchema.statics.findAccountByHostname = function(hostname: String): Promise<IAccountDocument> {
    let that = this;

    return new Promise<IAccountDocument>((resolve, reject) => {

        let hostnameTokens = hostname.split('.');

        // make sure the hotsname is in this format: subdomain.domain.com
        if (hostnameTokens.length !== 4) {
            reject('Invalid hostname');
        }

        let name = hostnameTokens[0];

        that.findOne({ 'database.name': name }, (err, account) => {
            if (err) {
                reject(err);
                return;
            }

            if (account) {
                resolve(account);
            } else {
                throw { code: 404, message: 'Account not found' };
            }
        });
    });

};

accountSchema.methods.getConnectionString = function() {
    return this.database.url;
};

export function getAccountModel(): IAccountModel {
    return <IAccountModel>mongoose.model('Account', accountSchema);
}
