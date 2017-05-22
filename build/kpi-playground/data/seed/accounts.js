"use strict";
var models_1 = require("../models");
var winston = require("winston");
function seedAccounts() {
    models_1.getMasterContext().then(function (masterContext) {
        var Account = masterContext.Account;
        Account.find({}).then(function (accounts) {
            if (accounts.length !== 0) {
                return;
            }
            winston.debug('Seeding Accounts');
            Account.create({
                name: 'Customer 1',
                personalInfo: {
                    fullname: 'Orlando Quero',
                    email: 'orlando@gmail.com'
                },
                businessInfo: {
                    numberOfLocations: 2,
                    country: 'US',
                    phoneNumber: '(123) 123 - 1234'
                },
                database: {
                    url: 'mongodb://localhost',
                    name: 'customer2'
                },
                audit: {
                    createdOn: Date(),
                    updatedOn: Date()
                }
            });
            Account.create({
                name: 'Customer 2',
                personalInfo: {
                    fullname: 'Mario Quero',
                    email: 'mario@gmail.com'
                },
                businessInfo: {
                    numberOfLocations: 2,
                    country: 'US',
                    phoneNumber: '(123) 123 - 1234'
                },
                database: {
                    url: 'mongodb://localhost',
                    name: 'customer2'
                },
                audit: {
                    createdOn: Date(),
                    updatedOn: Date()
                }
            });
        });
    });
}
exports.__esModule = true;
exports["default"] = seedAccounts;
;
//# sourceMappingURL=accounts.js.map