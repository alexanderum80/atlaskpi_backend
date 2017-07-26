import { GetChartQuery } from '../../queries/app/charts/get-chart.query';
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

            chartsList(preview: Boolean): String

            chart(id: String!, dateRange: DateRangeDetails!, xAxisSource: String!, frequency: String, grouping: String): String
        `,
        mutations: ``,
    },

    resolvers: {
        Query: {
            charts(root: any, args, ctx: IGraphqlContext) {
                let query = new GetChartQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-chart-data', query, args);
            },

            chartsList(root: any, args, ctx: IGraphqlContext) {
                let query = new GetChartsQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-charts', query, args);
            },

            chart(root: any, args, ctx: IGraphqlContext) {
                let query = new GetChartQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-chart', query, args);
            }
        },
        Mutation: {}
    }
};