import { GraphqlDefinition } from '../graphql-definition';
import { IGraphqlContext } from '../graphql-context';
import { FindAllUsersLogsQuery } from '../../queries/app/users-log';

export const userslogGql: GraphqlDefinition = {
    name: 'users-log',
    schema: {
        types: `
            type UsersLogResponse {
                    timestamp: String
                    accessBy: String
                    ipAddress: String
                    event: String 
            }
        `,
        queries: `usersLog(filter: String):[UsersLogResponse]`,
        mutations: ``,
    },
    resolvers: {
        Query:{
            usersLog(root: any, args, ctx: IGraphqlContext) { 
                let query = new FindAllUsersLogsQuery(ctx.req.identity, ctx.req.appContext.UserslogModel);
                return ctx.queryBus.run('get-users-log', query, args);
            }
        }
    }
}