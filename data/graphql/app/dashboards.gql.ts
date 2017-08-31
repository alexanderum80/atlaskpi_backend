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
            dashboard(id: String!): Dashboard
        `,
        mutations: ``,
    },

    resolvers: {
        Query: {
            dashboards(root: any, args: any, ctx: IGraphqlContext) {
                let query = new GetDashboardsQuery(ctx.req.identity, ctx.req.appContext, ctx.req.user);
                return ctx.queryBus.run('get-dashboards', query, args, ctx.req).catch(e => console.error(e));
            },
            dashboard(root: any, args: any, ctx: IGraphqlContext) {
                let query = new GetDashboardQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-dashboard', query, args, ctx.req).catch(e => console.error(e));
            }
        },
        Mutation: {}
    }
};