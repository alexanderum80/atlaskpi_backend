import { IUser, IUserProfile } from '../../models/app/users/index';
import { RemoveRoleMutation } from '../../mutations/app/roles/remove-role.mutation';
import { UpdateRoleMutation } from '../../mutations/app/roles/update-role.mutation';
import { IMutationResponse } from '../../models/common';
import { IRole, IRoleCustom, IRoleResponse, IUserRole } from '../../../lib/rbac/models/roles';
import { CreateRoleMutation } from '../../mutations/app/roles';
import { GetRolesQuery } from '../../queries/app/roles/get-roles.query';
import { GraphqlDefinition } from '../graphql-definition';
import { IGraphqlContext } from '../graphql-context';

export const rolesGql: GraphqlDefinition = {
    name: 'roles',
    schema: {
        types: `
            input RoleDetailsInput {
                name: String
                permissions: [String]
            }
            type RoleList {
                _id: String
                name: String
                permissions: [String]
                timestamp: String
            }
            type Role {
                _id: String
                name: String
                permissions: [Permission]
            }
            type RoleResult {
                success: Boolean
                entity: [User]
                errors: [ErrorDetails]
            }
        `,
        queries: `findAllRoles(filter: String): [RoleList]`,
        mutations: `
            createRole(data: RoleDetailsInput): Role
            updateRole(id: String, data: RoleDetailsInput): Role
            removeRole(id: String): RoleResult
        `
    },
    resolvers: {
        Query: {
            findAllRoles(root: any, args, ctx: IGraphqlContext) {
                let query = new GetRolesQuery(ctx.req.identity, ctx.req.appContext.Role);
                return ctx.queryBus.run('find-all-roles', query, args, ctx.req);
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
        RoleResult: {
            success(response: IMutationResponse) {
                return response.success; },
            entity(response: IMutationResponse) {
                return Array.isArray(response.entity) ? response.entity : [response.entity];
            },
            errors(response: IMutationResponse) {
                return response.errors; }
        }
    }
};