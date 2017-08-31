import { UpdateTargetMutation } from '../../mutations/app/targets/update-target.mutation';
import { IMutationResponse } from '../../models/common';
import { CreateTargetMutation } from '../../mutations/app/targets';
import { FindAllTargetsQuery } from '../../queries/app/targets';
import { FindTargetQuery } from '../../queries/app/targets';
import { IGraphqlContext } from '../';
import { GraphqlDefinition } from '../graphql-definition';

export const targetGql: GraphqlDefinition = {
    name: 'target',
    schema: {
        types: `
            input TargetInput {
                datepicker: String
                active: Boolean
                vary: String
                amount: String
                amountBy: String
                type: String
                period: String
                notify: [String]
                visible: [String]
                owner: String
                chart: [String]
            }
            type TargetResponse {
                datepicker: String
                active: Boolean
                vary: String
                amount: Float
                amountBy: String
                target: Float
                type: String
                period: String
                notify: [String]
                visible: [String]
                owner: String
                chart: [String]
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
        `,
        queries: `
            findTarget(id: String): TargetResponse
            findAllTargets(filter: String): TargetResponse
        `,
        mutations: `
            createTarget(data: TargetInput): TargetResult
            updateTarget(id: String, data: TargetInput): TargetResult
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
            }
        },
        Mutation: {
            createTarget(root: any, args, ctx: IGraphqlContext) {
                let mutation = new CreateTargetMutation(ctx.req.identity, ctx.req.appContext.Target, ctx.req.appContext);
                return ctx.mutationBus.run<IMutationResponse>('create-target', ctx.req, mutation, args);
            },
            updateTarget(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateTargetMutation(ctx.req.identity, ctx.req.appContext.Target, ctx.req.appContext.User);
                return ctx.mutationBus.run<IMutationResponse>('update-target', ctx.req, mutation, args);
            }
            // deleteTarget(root: any, args, ctx: IGraphqlContext) {
            //     let mutation = new UpdateTargetMutation(ctx.req.identity, ctx.req.appContext.Target, ctx.req.appContext.User);
            //     return ctx.mutationBus.run<IMutationResponse>('remove-target', ctx.req, mutation, args);
            // }
        },
        TargetResult: {
            success(response: IMutationResponse) { return response.success; },
            entity(response: IMutationResponse) { return response.entity; },
            errors(response: IMutationResponse) { return response.errors; }
        }
    }
};