import { GetStatesForCountryQuery } from '../../queries/master/countries/get-states-for-country.query';
import { GetCountriesQuery } from '../../queries/master/countries/get-countries.query';
import { IGraphqlContext } from '../';
import { GraphqlDefinition } from '../graphql-definition';
import { ExtendedRequest } from '../../../middlewares';
import * as logger from 'winston';

export const countriesGql: GraphqlDefinition = {
    name: 'countries',
    schema: {
        types: `
            type Country {
                _id: String
                name: String
                continent: String
            }

            type State {
                _id: String
                country: String
                name: String
                code: String
            }
        `,
        queries: `
            countries: [Country]
            statesFor(country: String!): [State]
        `,
        mutations: ``,
    },

    resolvers: {
        Query: {
            countries(root: any, args, ctx: IGraphqlContext) {
                let query = new GetCountriesQuery(ctx.req.masterContext.Country);
                return ctx.queryBus.run('get-country-info', query, args);
            },
            statesFor(root: any, args, ctx: IGraphqlContext) {
                let query = new GetStatesForCountryQuery(ctx.req.masterContext.State);
                return ctx.queryBus.run('get-country-info', query, args.country);
            },
        },
        Mutation: {}
    }
};