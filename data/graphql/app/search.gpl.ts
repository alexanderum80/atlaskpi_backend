import { AdaptEngine, AdaptIntents } from '../../queries/app/search/adap-engine';
import { IGraphqlContext } from '../';
import { GraphqlDefinition } from '../graphql-definition';
import { ExtendedRequest } from '../../../middlewares';
import { SearchQuery } from '../../queries';
import * as logger from 'winston';

export const searchGql: GraphqlDefinition = {
    name: 'search',
    schema: {
        types: `
            type SearchResultItem {
                section: String
                data: String
            }
        `,
        queries: `
            search(sections: [String]!, query: String!): [SearchResultItem]
        `,
        mutations: ``,
    },

    resolvers: {
        Query: {
            search(root: any, args, ctx: IGraphqlContext) {
                const adaptEngine = new AdaptEngine([AdaptIntents.Chart]);
                let query = new SearchQuery(ctx.req.identity, ctx.req.appContext, adaptEngine);
                return ctx.queryBus.run('search', query, args, ctx.req);
            }
        },
        Mutation: {}
    }
};