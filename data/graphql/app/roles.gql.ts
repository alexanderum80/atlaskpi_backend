import { RemoveRoleMutation } from '../../mutations/app/roles/remove-role.mutation';
import { UpdateRoleMutation } from '../../mutations/app/roles/update-role.mutation';
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
            input RoleList {
                _id: String
                name: String
                permissions: [String]
            }
            input RoleDetails {
                name: String
                permissions: [String]
            }
            type IRoleList {
                _id: String
                name: String
                permissions: [String]
                timestamp: String
            }
            type Role {
                _id: String
                name: String
                permissions: [String]
            }
        `,
        queries: `findAllRoles(filter: String): [IRoleList]`,
        mutations: `
            createRole(data: RoleDetails): Role
            updateRole(id: String, data: RoleDetails): Role
            removeRole(id: String): Role
        `
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
                let mutation = new CreateRoleMutation(ctx.req.identity, ctx.req.appContext.Role);
                return ctx.mutationBus.run<IMutationResponse>('create-role', ctx.req, mutation, args);
            },
            updateRole(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateRoleMutation(ctx.req.identity, ctx.req.appContext.Role);
                return ctx.mutationBus.run<IMutationResponse>('update-role', ctx.req, mutation, args);
            },
            removeRole(root: any, args, ctx: IGraphqlContext) {
                let mutation = new RemoveRoleMutation(ctx.req.identity, ctx.req.appContext.Role, ctx.req.appContext.User);
                return ctx.mutationBus.run<IMutationResponse>('remove-role', ctx.req, mutation, args);
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