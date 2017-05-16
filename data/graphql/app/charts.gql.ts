import { GetChartsQuery } from '../../queries/app/charts/get-charts.query';
import { GetChartDefinitionQuery } from '../../queries';
import { GraphqlDefinition } from '../graphql-definition';
import { ExtendedRequest } from '../../../middlewares';
import { IGraphqlContext } from '../graphql-context';
import * as logger from 'winston';

export const chartsGql: GraphqlDefinition = {
    name: 'reporting',
    schema: {
        types: ``,
        queries: `
            charts(from: String!, to: String!, preview: Boolean): String
            getChartDefinition(id: String!, from: String!, to: String!): String
        `,
        mutations: ``,
    },

    resolvers: {
        Query: {
            charts(root: any, args, ctx: IGraphqlContext) {
                let query = new GetChartsQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-chart-data', query, args);
            },
            getChartDefinition(root: any, args, ctx: IGraphqlContext) {
                let query = new GetChartDefinitionQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-chart-data', query, args)
                    .then(definition => JSON.stringify(definition));
            }
        },
        Mutation: {}
    }
};