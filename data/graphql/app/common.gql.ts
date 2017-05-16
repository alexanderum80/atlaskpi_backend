import { GraphqlDefinition } from '../graphql-definition';
import { ExtendedRequest } from '../../../middlewares';
import * as logger from 'winston';

export const commonGql: GraphqlDefinition = {
    name: 'common',
    schema: {
        types: `
         type PaginationInfo {
            itemsPerPage: Int
            currentPage: Int
            totalItems: Int
        }
        input PaginationDetails {
            page: Int!
            itemsPerPage: Int!
            sortBy: String
            filter: String
        }
        type ErrorDetails {
            field: String
            errors: [String]!
        }
        input DateRange {
            from: String
            to: String
        }
       `,
        queries: ``,
        mutations: ``,
    },

    resolvers: {
        Query: {},
        Mutation: {}
   }
};