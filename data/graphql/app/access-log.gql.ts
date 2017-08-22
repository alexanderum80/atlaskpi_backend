import { IQueryResponse } from '../../models/common';
import { IAccessLogDocument } from '../../models/app/access-log/IAccessLog';
import { FindAllAcessLogsQuery } from '../../queries/app/access-log';
import { IMutationResponse } from '../../models/common';
import { CreateAccessLogMutation } from '../../mutations/app/access-log';
import { GraphqlDefinition } from '../graphql-definition';
import { IGraphqlContext } from '../';

export const accessLogGql: GraphqlDefinition = {
    name: 'access-log',
    schema: {
        types: `
            input IResultEntry {
                authorized: Boolean
                status: Boolean
                details: Boolean
            }
            input IAccessLogInput {
                timestamp: Date
                accessBy: String
                ipAddress: String
                clientDetails: String
                event: String
                eventType: String
                payload: String
                result: IResultEntry
            }
            type ResultResponse {
                authorized: Boolean
                status: Boolean
                details: Boolean                
            }
            type AccessLogResponse {
                timestamp: Date
                accessBy: String
                ipAddress: String
                clientDetails: String
                event: String
                eventType: String
                payload: String
                result: ResultResponse
            }
            type AccessLogResult {
                success: Boolean
                entity: AccessLogResponse
                error: [ErrorDetails]
            }
        `,
        queries: `
            accessLogs(filter: String): AccessLogResponse
        `,
        mutations: ``
    },
    resolvers: {
        Query: {
            accessLogs(root: any, args, ctx: IGraphqlContext) {
                let query = new FindAllAcessLogsQuery(ctx.req.identity, ctx.req.appContext.AccessModel);
                return ctx.queryBus.run('find-all-access-logs', query, args);
            }
        },
        // Mutation: {
        //     createAccessLog(root: any, args, ctx: IGraphqlContext) {
        //         let mutation = new CreateAccessLogMutation(ctx.req.identity, ctx.req.appContext.AccessModel);
        //         return ctx.mutationBus.run<IMutationResponse>('create-access-log', ctx.req, mutation, args);
        //     }
        // },
        AccessLogResponse: {
            result(response: IAccessLogDocument) {
                return response.result;
            }
        }
    }
};