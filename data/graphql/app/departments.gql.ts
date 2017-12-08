import {
    DeleteDepartmentMutation
} from '../../mutations/app/departments/delete-department.mutation';
import {
    deleteDepartmentActivity
} from '../../../activities/app/departments/delete-department.activity';
import {
    UpdateDepartmentMutation
} from '../../mutations/app/departments/update-department.mutation';
import {
    DepartmentByIdQuery
} from '../../queries/app/departments/department-by-id.query';
import {
    DepartmentsQuery
} from '../../queries/app/departments/departments.query';
import {
    IMutationResponse
} from '../../models/common';
import {
    CreateDepartmentMutation
} from '../../mutations/app/departments/create-department.mutation';
import {
    GraphqlDefinition
} from '../graphql-definition';
import {
    ExtendedRequest
} from '../../../middlewares';
import {
    IGraphqlContext
} from '../graphql-context';

import * as logger from 'winston';

export const departmentsGql: GraphqlDefinition = {
    name: 'departments',
    schema: {
        types: `
            type Department {
                _id: String
                name: String
                manager: String
                }

            type UpdateDepartmentResponse {
                success: Boolean
                entity: Department
                errors: [ErrorDetails]
            }

            type CreateDepartmentResponse {
                success: Boolean
                entity: Department
                errors: [ErrorDetails]
            }

            type DeleteDepartmentResponse {
                success: Boolean
                entity: Department
                errors: [ErrorDetails]
            }
        `,
        queries: `
            departments: [Department]
            departmentById(id: String!): Department
            `,
        mutations: `
            createDepartment(name: String!, manager: String): CreateDepartmentResponse
            updateDepartment(_id: String!,name: String!, manager: String): UpdateDepartmentResponse
            deleteDepartment(_id: String!): DeleteDepartmentResponse
            `,
    },

    resolvers: {
        Query: {

           departments(root: any, args, ctx: IGraphqlContext) {
                let query = new DepartmentsQuery(ctx.req.identity, ctx.req.appContext.DepartmentModel);
                return ctx.queryBus.run('list-departments', query, args);
            },
            departmentById(root: any, args, ctx: IGraphqlContext) {
                let query = new DepartmentByIdQuery(ctx.req.identity, ctx.req.appContext.DepartmentModel);
                return ctx.queryBus.run('department-by-id', query, args);
            }
        },
        Mutation: {
            createDepartment(root: any, args, ctx: IGraphqlContext) {
            let mutation = new CreateDepartmentMutation(ctx.req.identity, ctx.req.appContext.DepartmentModel);
            return ctx.mutationBus.run < IMutationResponse > ('create-department', ctx.req, mutation, args);
           },
            updateDepartment(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateDepartmentMutation(ctx.req.identity, ctx.req.appContext.DepartmentModel);
                return ctx.mutationBus.run < IMutationResponse > ('update-department', ctx.req, mutation, args);
            },
            deleteDepartment(root: any, args, ctx: IGraphqlContext) {
                let mutation = new DeleteDepartmentMutation(ctx.req.identity, ctx.req.appContext.DepartmentModel);
                return ctx.mutationBus.run < IMutationResponse > ('delete-department', ctx.req, mutation, args);
            },
        },
    }
};