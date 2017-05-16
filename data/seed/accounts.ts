import connectToMongoDb from '../mongo-utils';
import { getMasterContext } from '../models';
import * as winston from 'winston';


export default function seedAccounts() {

    getMasterContext().then((masterContext) => {
        let Account = masterContext.Account;

        Account.find({}).then((accounts) => {

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
                    phoneNumber: '(123) 123 - 1234',
                },
                database: {
                    url: 'mongodb://localhost',
                    name: 'customer2',
                },
                audit: {
                    createdOn: Date(),
                    updatedOn: Date(),
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
                    phoneNumber: '(123) 123 - 1234',
                },
                database: {
                    url: 'mongodb://localhost',
                    name: 'customer2',
                },
                audit: {
                    createdOn: Date(),
                    updatedOn: Date(),
                }
            });

        })

    });
};
