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
        input DateRangeInput {
            from: String
            to: String
        }
        input ChartDateRangeInput {
            predefined: String
            custom: DateRangeInput
        }
        type DateRange {
            from: String
            to: String
        }
        type ChartDateRange {
            predefined: String,
            custom: DateRange
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