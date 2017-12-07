import { TestTargetNotification } from '../../../services/notifications/users/test-target.notification';
import { RemoveTargetFromChart } from '../../mutations/app/targets/remove-target-from-chart.mutation';
import { RemoveTargetMutation } from '../../mutations/app/targets/remove-target.mutation';
import { UpdateTargetMutation } from '../../mutations/app/targets/update-target.mutation';
import { IMutationResponse } from '../../models/common';
import { CreateTargetMutation } from '../../mutations/app/targets';
import { FindAllTargetsQuery, TestTargetNotificationQuery } from '../../queries/app/targets';
import { FindTargetQuery } from '../../queries/app/targets';
import { IGraphqlContext } from '../';
import { GraphqlDefinition } from '../graphql-definition';
import { getRequestHostname } from '../../../lib/utils/helpers';

export const targetGql: GraphqlDefinition = {
    name: 'target',
    schema: {
        types: `
            input NotifyInput {
                users: [String]
                notification: String
            }
            input TargetInput {
                name: String
                datepicker: String
                vary: String
                amount: String
                active: Boolean
                amountBy: String
                type: String
                period: String
                notify: NotifyInput
                visible: [String]
                owner: String
                chart: [String]
                stackName: String
                nonStackName: String
            }
            input TargetOwner {
                owner: String
            }
            input TestNotificationInput {
                id: [String]
                targetId: String
            }

            type NotifyResponse {
                users: [String]
                notification: String
            }
            type TargetResponse {
                _id: String
                name: String
                datepicker: String
                vary: String
                amount: Float
                amountBy: String
                active: Boolean
                target: Float
                type: String
                period: String
                notify: NotifyResponse
                visible: [String]
                owner: String
                chart: [String]
                stackName: String
                nonStackName: String
            }
            type TargetRemoveResponse {
                _id: String
            }
            type TargetResult {
                success: Boolean
                entity: TargetResponse
                errors: [ErrorDetails]
            }
            type TargetQueryResult {
                target: TargetResponse
                errors: [ErrorDetails]
            }
            type TargetRemoveResult {
                success: Boolean
                entity: TargetRemoveResponse
                errors: [ErrorDetails]
            }
            type TestNotificationResponse {
                errors: [ErrorDetails]
                success: Boolean
            }
        `,
        queries: `
            findTarget(id: String): TargetResponse
            findAllTargets(filter: String): TargetResponse
            testNotification(input: TestNotificationInput): TestNotificationResponse
        `,
        mutations: `
            createTarget(data: TargetInput): TargetResult
            updateTarget(id: String, data: TargetInput): TargetResult
            removeTarget(id: String, owner: String): TargetRemoveResult
            removeTargetFromChart(id: String): TargetRemoveResult
        `
    },
    resolvers: {
        Query: {
            findTarget(root: any, args, ctx: IGraphqlContext) {
                let query = new FindTargetQuery(ctx.req.identity, ctx.req.appContext.Target);
                return ctx.queryBus.run('find-target', query, args, ctx.req);
            },
            findAllTargets(root: any, args, ctx: IGraphqlContext) {
                let query = new FindAllTargetsQuery(ctx.req.identity, ctx.req.appContext.Target);
                return ctx.queryBus.run('find-all-targets', query , args, ctx.req);
            },
            testNotification(root: any, args, ctx: IGraphqlContext) {
                const notifier = new TestTargetNotification(ctx.config, { hostname: getRequestHostname(ctx.req)});
                const query = new TestTargetNotificationQuery(ctx.req.identity, notifier, ctx.req.appContext.User);
                return ctx.queryBus.run('test-target-notification', query, args, ctx.req);
            }
        },
        Mutation: {
            createTarget(root: any, args, ctx: IGraphqlContext) {
                let mutation = new CreateTargetMutation(ctx.req.identity, ctx.req.appContext.Target, ctx.req.appContext);
                return ctx.mutationBus.run<IMutationResponse>('create-target', ctx.req, mutation, args);
            },
            updateTarget(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateTargetMutation(ctx.req.identity, ctx.req.appContext.Target, ctx.req.appContext);
                return ctx.mutationBus.run<IMutationResponse>('update-target', ctx.req, mutation, args);
            },
            removeTarget(root: any, args, ctx: IGraphqlContext) {
                let mutation = new RemoveTargetMutation(ctx.req.identity, ctx.req.appContext.Target, ctx.req.appContext);
                return ctx.mutationBus.run<IMutationResponse>('remove-target', ctx.req, mutation, args);
            },
            removeTargetFromChart(root: any, args, ctx: IGraphqlContext) {
                let mutation = new RemoveTargetFromChart(ctx.req.identity, ctx.req.appContext.Target);
                return ctx.mutationBus.run<IMutationResponse>('remove-target-from-chart', ctx.req, mutation, args);
            }
        },
        TargetResponse: {
            notify(response: any) { return response.notify; }
        },
        TargetResult: {
            success(response: IMutationResponse) { return response.success; },
            entity(response: IMutationResponse) { return response.entity; },
            errors(response: IMutationResponse) { return response.errors; }
        },
        TargetRemoveResult: {
            success(response: IMutationResponse) { return response.success; },
            entity(response: IMutationResponse) { return response.entity; },
            errors(response: IMutationResponse) { return response.errors; }
        },
        TargetQueryResult: {
            target(response: any) { return response.target; },
            errors(response: any) { return response.errors; }
        }
    }
};