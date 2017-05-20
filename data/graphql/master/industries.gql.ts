import { GraphqlDefinition } from '../graphql-definition';
import { IIndustry, IIndustryDocument } from '../../models';
import { ExtendedRequest } from '../../../middlewares';
import { GetIndustriesQuery } from '../..';
import * as logger from 'winston';
import { IGraphqlContext } from '..';

export const industriesGql: GraphqlDefinition = {
    name: 'industries',
    schema: {
        types: `
            type SubIndustry {
                _id: String
                name: String
            }
            type Industry {
                _id: String
                name: String
                subIndustries: [SubIndustry]
            }
        `,
        queries: `
            industries: [Industry]
        `,
        mutations: `
        `
    },

    resolvers: {
        Query: {
            industries(root: any, args, ctx: IGraphqlContext) {
                let query = new GetIndustriesQuery(ctx.req.identity, ctx.req.masterContext.Industry);
                return ctx.queryBus.run<IIndustry[]>('get-industries', query, args)
                                                    .then((industries) => industries, (err) => err);
            },
        },

        Mutation: { },

        Industry: {
            subIndustries(industry: IIndustryDocument) { return industry.subIndustries; }
        },
    }
};
