import { GetIsDemoModeQuery } from '../../queries/master/get-is-demo-mode.query';
import { GraphqlDefinition } from '../graphql-definition';
import { IAccount } from '../../models';
import { ExtendedRequest } from '../../../middlewares';
import { CreateAccountMutation, GetAccountQuery, AccountNameAvailableQuery } from '../..';
import * as logger from 'winston';
import { IGraphqlContext } from '..';
import { IMutationResponse, IPagedQueryResult } from '../../models/common';

export const accountsGql: GraphqlDefinition = {
    name: 'accounts',
    schema: {
        types: `
            input BusinessInfoDetails {
                numberOfLocations: Int
                country: String
                phoneNumber: String
            }
            input PersonalInfoDetails {
                fullname: String
                email: String
            }
            input AccountDetails {
                name: String!
                personalInfo: PersonalInfoDetails
                seedData: Boolean
            }
            type PersonalInfo {
                fullname: String
                email: String!
            }
            type BusinessInfo {
                numberOfLocations: Int
                country: String
                phoneNumber: String
            }
            type UserToken {
                issued: String
                expires: String
                access_token: String
            }
            type Account {
                _id: String
                name: String
                personalInfo: PersonalInfo
                businessInfo: BusinessInfo
                subdomain: String!
                initialToken: UserToken
            }
            type AccountResult {
                account: Account
                errors: [ErrorDetails]
            }
            type AccountNameAvailability {
                isAvailable: Boolean
            }
        `,
        queries: `
            account(name: String): Account
            accountNameAvailable(name: String!): AccountNameAvailability
            inDemoMode: Boolean
        `,
        mutations: `
            createAccount(account: AccountDetails) : AccountResult
        `
    },

    resolvers: {
        Query: {
            account(root: any, args, ctx: IGraphqlContext) {
                let query = new GetAccountQuery(ctx.req.identity, ctx.req.masterContext.Account);
                return ctx.queryBus.run<IAccount>('get-account', query, args)
                                                 .then((account) => account, (err) => err);
            },
            accountNameAvailable(root: any, args, ctx: IGraphqlContext) {
                let query = new AccountNameAvailableQuery(ctx.req.identity, ctx.req.masterContext.Account);
                return ctx.queryBus.run('account-name-available', query, args);
            },
            inDemoMode(root: any, args, ctx: IGraphqlContext) {
                let query = new GetIsDemoModeQuery(ctx.req.identity, ctx.req.account, ctx.req.appContext.User);
                return ctx.queryBus.run('account-name-available', query, args);
            }
        },

        Mutation: {
            createAccount(root: any, args, ctx: IGraphqlContext) {
                let mutation = new CreateAccountMutation(ctx.req.identity, ctx.req.masterContext.Account);
                return ctx.mutationBus.run<IMutationResponse>('create-account', ctx.req, mutation, args);
            },
        },

        Account: {
            personalInfo(account) {
                return {
                    fullname: account.personalInfo.fullname || '',
                    email: account.personalInfo.email || '',
                };
            },

            businessInfo(account) {
                return {
                    numberOfLocations: account.businessInfo.numberOfLocations || '',
                    country: account.businessInfo.country || '',
                    phoneNumber: account.businessInfo.phoneNumber || '',
                };
            },

            initialToken(account) {
                return {
                    issued: account.initialToken.issued,
                    expires: account.initialToken.expires,
                    access_token: account.initialToken.access_token
                };
            },

        },

        AccountResult: {
            account(response: IMutationResponse) {
                return response.entity; },
            errors(response: IMutationResponse) {
                return response.errors; }
        },

        AccountNameAvailability: {
            isAvailable(response: Boolean) {
                return response; }
        }
    }
};
