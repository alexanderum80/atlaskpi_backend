"use strict";
var __1 = require("../..");
exports.accountsGql = {
    name: 'accounts',
    schema: {
        types: "\n            input BusinessInfoDetails {\n                numberOfLocations: Int\n                country: String\n                phoneNumber: String\n            }\n            input PersonalInfoDetails    {\n                fullname: String\n                email: String\n            }\n            input AccountDetails {\n                name: String!\n                personalInfo: PersonalInfoDetails\n                businessInfo: BusinessInfoDetails\n            }\n\n            type PersonalInfo {\n                fullname: String\n                email: String!\n            }\n\n            type BusinessInfo {\n                numberOfLocations: Int\n                country: String\n                phoneNumber: String\n            }\n\n            type Account {\n                _id: String\n                name: String\n                personalInfo: PersonalInfo\n                businessInfo: BusinessInfo  \n            }\n\n             type AccountResult {\n                account: Account\n                errors: [ErrorDetails]\n            }\n        ",
        queries: "\n            account(name: String): Account\n        ",
        mutations: "\n            createAccount(account: AccountDetails) : AccountResult\n        "
    },
    resolvers: {
        Query: {
            account: function (root, args, ctx) {
                var query = new __1.GetAccountQuery(ctx.req.identity, ctx.req.masterContext.Account);
                return ctx.queryBus.run('get-account', query, args)
                    .then(function (account) { return account; }, function (err) { return err; });
            }
        },
        Mutation: {
            createAccount: function (root, args, ctx) {
                var mutation = new __1.CreateAccountMutation(ctx.req.identity, ctx.req.masterContext.Account);
                return ctx.mutationBus.run('create-account', ctx.req, mutation, args);
            }
        },
        Account: {
            personalInfo: function (account) {
                return {
                    fullname: account.personalInfo.fullname || '',
                    email: account.personalInfo.email || ''
                };
            },
            businessInfo: function (account) {
                return {
                    numberOfLocations: account.businessInfo.numberOfLocations || '',
                    country: account.businessInfo.country || '',
                    phoneNumber: account.businessInfo.phoneNumber || ''
                };
            }
        },
        AccountResult: {
            account: function (response) { return response.entity; },
            errors: function (response) { return response.errors; }
        }
    }
};
//# sourceMappingURL=accounts.gql.js.map