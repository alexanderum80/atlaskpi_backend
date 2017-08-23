import { IMutationResponse } from '../../models/common';
import { IRoleCustom, IRoleResponse } from '../../../lib/rbac/models/roles';
import { CreateRoleMutation } from '../../mutations/app/roles';
import { GetRolesQuery } from '../../queries/app/roles/get-roles.query';
import { GraphqlDefinition } from '../graphql-definition';
import { IGraphqlContext } from '../graphql-context';

export const rolesGql: GraphqlDefinition = {
    name: 'roles',
    schema: {
        types: `
            input RoleDetails {
                name: String
                permissions: [String]
            }
            type IRoleList {
                _id: String
                name: String
                permissions: [String]
            }
            type Role {
                _id: String
                name: String
                permissions: [String]
            }
        `,
        queries: `findAllRoles(filter: String): [IRoleList]`,
        mutations: `createRole(data: RoleDetails): Role`
    },
    resolvers: {
        Query: {
            findAllRoles(root: any, args, ctx: IGraphqlContext) {
                let query = new GetRolesQuery(ctx.req.identity, ctx.req.appContext.Role);
                return ctx.queryBus.run('find-all-roles', query, args);
            }
        },
        Mutation: {
            createRole(root: any, args, ctx: IGraphqlContext) {
                let query = new CreateRoleMutation(ctx.req.identity, ctx.req.appContext.Role);
                return ctx.queryBus.run<IMutationResponse>('create-role', query, args);
            }
        },
        Role: {
            _id(data: IRoleResponse) {
                return (<any>data).entity._id;
            },
            name(data: IRoleResponse) {
                return (<any>data).entity.name;
            },
            permissions(data: IRoleResponse) {
                return (<any>data).entity.permissions;
            }
        }
    }
}