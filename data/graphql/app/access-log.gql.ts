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
                timestamp: String
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
                timestamp: String
                accessBy: String
                ipAddress: String
                clientDetails: String
                event: String
                eventType: String
                payload: String
            }
            type AccessLogResult {
                success: Boolean
                entity: AccessLogResponse
                error: [ErrorDetails]
            }
        `,
        queries: `
            accessLogs(filter: String): [AccessLogResponse]
        `,
        mutations: ``,
    },
    resolvers: {
        Query: {
            accessLogs(root: any, args, ctx: IGraphqlContext) {
                let query = new FindAllAcessLogsQuery(ctx.req.identity, ctx.req.appContext.AccessModel);
                return ctx.queryBus.run('get-all-access-logs', query, args, ctx.req);
            }
        },
        Mutation: {}
    }
};