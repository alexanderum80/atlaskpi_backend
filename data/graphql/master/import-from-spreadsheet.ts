import { importSpreadSheet } from '../../google-spreadsheet/google-spreadsheet';
import { GraphqlDefinition } from '../graphql-definition';
import { IAccount } from '../../models';
import { ExtendedRequest } from '../../../middlewares';
import { CreateAccountMutation, GetAccountQuery } from '../..';
import * as logger from 'winston';
import { IGraphqlContext } from '..';
import * as Promise from 'bluebird';

export const spreadsheetGpl: GraphqlDefinition = {
    name: 'google-spreadsheet',
    schema: {
        types: `
            type ImportResult {
                name: String
                total: Int
            }
        `,
        queries: `

        `,
        mutations: `
            refreshDataFromSpreadSheet(customer: String) : [ImportResult]
        `
    },

    resolvers: {
        Query: {},
        Mutation: {
            refreshDataFromSpreadSheet(root: any, args, ctx: IGraphqlContext): Promise<any> {
                return importSpreadSheet(ctx.req);
            },
        }
    }
};


