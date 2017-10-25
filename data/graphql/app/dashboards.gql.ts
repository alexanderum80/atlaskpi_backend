import { DeleteDashboardMutation } from '../../mutations/app/dashboards/delete-dashboard.mutation';
import { UpdateDashboardMutation } from '../../mutations/app/dashboards/update-dashboard.mutation';
import { CreateDashboardMutation } from '../../mutations/app/dashboards';
import { GetDashboardQuery, GetDashboardsQuery } from '../../queries/app/dashboards';
import { IGraphqlContext } from '../graphql-context';
import { GraphqlDefinition } from '../graphql-definition';
import { ExtendedRequest } from '../../../middlewares';

import { IMutationResponse } from '../../models/common';
import * as logger from 'winston';

export const dashboardGql: GraphqlDefinition = {
    name: 'dashboards',
    schema: {
        types: `
            type Dashboard {
                _id: String
                name: String
                description: String
                group: String
                charts: [String]
                widgets: [String]
                users: [String]
            }

            type DashboardResponse
            {
                success: Boolean
                entity: Dashboard
                errors: [ErrorDetails]
            }
        `,
        queries: `
            dashboards(group: String): [Dashboard]
            dashboard(id: String!): Dashboard
        `,
        mutations: `
            createDashboard(name: String!, description: String!, group: String!, charts: [String]!, users: [String]): Dashboard
            updateDashboard(_id: String!, name: String!, description: String!, group: String!, charts: [String]!, users: [String]): DashboardResponse
            deleteDashboard(_id: String!): DashboardResponse
        `,
    },

    resolvers: {
        Query: {
            dashboards(root: any, args: any, ctx: IGraphqlContext) {
                let query = new GetDashboardsQuery(ctx.req.identity, ctx.req.appContext, ctx.req.user);
                return ctx.queryBus.run('get-dashboards', query, args, ctx.req).catch(e => console.error(e));
            },
            dashboard(root: any, args: any, ctx: IGraphqlContext) {
                let query = new GetDashboardQuery(ctx.req.identity, ctx.req.appContext, ctx.req.user);
                return ctx.queryBus.run('get-dashboard', query, args, ctx.req).catch(e => console.error(e));
            }
        },
        Mutation: {
            createDashboard(root: any, args, ctx: IGraphqlContext) {
                let mutation = new CreateDashboardMutation(ctx.req.identity, ctx.req.appContext.Dashboard);
                return ctx.mutationBus.run<IMutationResponse>('create-dashboard', ctx.req, mutation, args);
            },
            updateDashboard(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateDashboardMutation(ctx.req.identity, ctx.req.appContext.Dashboard);
                return ctx.mutationBus.run<IMutationResponse>('update-dashboard', ctx.req, mutation, args);
            },
            deleteDashboard(root: any, args, ctx: IGraphqlContext) {
                let mutation = new DeleteDashboardMutation(ctx.req.identity, ctx.req.appContext.Dashboard);
                return ctx.mutationBus.run<IMutationResponse>('delete-dashboard', ctx.req, mutation, args);
            }
        },
        DashboardResponse: {
            success(response: IMutationResponse) {
                return response.success; },
            entity(response: IMutationResponse) {
                return response.entity; },
            errors(response: IMutationResponse) {
                return response.errors; }
        }
    }
};