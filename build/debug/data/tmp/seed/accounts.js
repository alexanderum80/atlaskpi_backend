"use strict";
var winston = require("winston");
function seedAccounts(accountModel) {
    accountModel.find({}).then(function (accounts) {
        if (accounts.length !== 0) {
            return;
        }
        winston.debug('Seeding Accounts');
        accountModel.create({
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
        accountModel.create({
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
}
exports.__esModule = true;
exports["default"] = seedAccounts;
;
//# sourceMappingURL=accounts.js.map