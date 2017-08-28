import { GraphqlDefinition } from '../graphql-definition';
import { IGraphqlContext } from '../graphql-context';
import { GetPermissionsQuery } from '../../queries/app/permissions/get-permissions.query';

export const permissionGql: GraphqlDefinition = {
    name: 'permission',
    schema: {
        types: `
            type IPermissionInfo {
                _id: String
                action: String
                subject: String
            }
        `,
        queries: `findAllPermissions(filter: String): [IPermissionInfo]`,
        mutations: ``
    },
    resolvers: {
        Query: {
            findAllPermissions(root: any, args, ctx: IGraphqlContext) {
                let query = new GetPermissionsQuery(ctx.req.identity, ctx.req.appContext.Permission);
                return ctx.queryBus.run('find-all-permissions', query, args);
            }
        }
    }
}