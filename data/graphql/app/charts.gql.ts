import { GetChartQuery } from '../../queries/app/charts/get-chart.query';
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

            chart(id: String!, dateRange: DateRange!, xAxisSource: String!, frequency: String, grouping: String): String
        `,
        mutations: ``,
    },

    resolvers: {
        Query: {
            charts(root: any, args, ctx: IGraphqlContext) {
                let query = new GetChartQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-chart-data', query, args);
            },

            chart(root: any, args, ctx: IGraphqlContext) {
                let query = new GetChartQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-chart', query, args);
            }
        },
        Mutation: {}
    }
};