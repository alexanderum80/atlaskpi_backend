import { GetDashboardQuery, GetDashboardsQuery } from '../../queries/app/dashboards';
import { IGraphqlContext } from '../graphql-context';
import { GraphqlDefinition } from '../graphql-definition';
import { ExtendedRequest } from '../../../middlewares';
import * as logger from 'winston';

export const dashboardGql: GraphqlDefinition = {
    name: 'dashboards',
    schema: {
        types: `
            type Dashboard {
                _id: String
                name: String
                group: String
                charts: [String]
            }
        `,
        queries: `
            dashboards(group: String): [Dashboard]
            dashboard(id: String!, dateRange: DateRange!, frequency: String): Dashboard
        `,
        mutations: ``,
    },

    resolvers: {
        Query: {
            dashboards(root: any, args: any, ctx: IGraphqlContext) {
                let query = new GetDashboardsQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-dashboards', query, args);
            },
            dashboard(root: any, args: any, ctx: IGraphqlContext) {
                let query = new GetDashboardQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-dashboard', query, args);
            }
        },
        Mutation: {}
    }
};