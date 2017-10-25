import {
    DeleteEmployeeMutation
} from '../../mutations/app/employees/delete-employee.mutation';
import {
    UpdateEmployeeMutation
} from '../../mutations/app/employees/update-employee.mutation';
import {
    EmployeeByIdQuery
} from '../../queries/app/employees/employee-by-id.query';
import {
    EmployeesQuery
} from '../../queries/app/employees/employees.query';
import {
    IMutationResponse
} from '../../models/common';
import {
    CreateEmployeeMutation
} from '../../mutations/app/employees/create-employee.mutation';
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

export const employeesGql: GraphqlDefinition = {
    name: 'employees',
    schema: {
        types: `
            type Employee {
                _id: String
                firstName: String
                middleName: String
                lastName: String
                email: String
                primaryNumber: String
                dob: String
                nationality: String
                maritalStatus: String
                address: TAddress
                employmentInfo: TEmploymentInfo
            }

            input EmploymentInfo {
                location: String
                bussinessUnit: String
                departament: String
                position: String
                startDate: String
                typeOfEmployment: String
                frequency: String
                rate: String
            }

            input Address {
                street1: String
                street2: String
                city: String
                state: String
                country: String
                zipCode: String
            }

            type TEmploymentInfo {
                location: String
                bussinessUnit: String
                departament: String
                position: String
                startDate: String
                typeOfEmployment: String
                frequency: String
                rate: String
            }

            type TAddress {
                street1: String
                street2: String
                city: String
                state: String
                country: String
                zipCode: String
            }

            type UpdateEmployeeResponse {
                success: Boolean
                entity: Employee
                errors: [ErrorDetails]
            }

            type CreateEmployeeResponse {
                success: Boolean
                entity: Employee
                errors: [ErrorDetails]
            }

            type DeleteEmployeeResponse {
                success: Boolean
                entity: Employee
                errors: [ErrorDetails]
            }
        `,
        queries: `
            employees: [Employee]
            employeeById(id: String!): Employee
        `,
        mutations: `
            createEmployee(firstName: String!, middleName: String!, lastName: String!, email: String, primaryNumber: String, dob: String, nationality: String, maritalStatus: String, address: Address, employmentInfo: EmploymentInfo): CreateEmployeeResponse
            updateEmployee(_id: String!, firstName: String!, middleName: String, lastName: String!, email: String!, primaryNumber: String!, dob: String!, nationality: String!, maritalStatus: String!, address: Address!, employmentInfo: EmploymentInfo!): UpdateEmployeeResponse
            deleteEmployee(_id: String!): DeleteEmployeeResponse
            `,
    },

    resolvers: {
        Query: {

            employees(root: any, args, ctx: IGraphqlContext) {
                let query = new EmployeesQuery(ctx.req.identity, ctx.req.appContext.EmployeeModel);
                return ctx.queryBus.run('list-employees', query, args);
            },
            employeeById(root: any, args, ctx: IGraphqlContext) {
                let query = new EmployeeByIdQuery(ctx.req.identity, ctx.req.appContext.EmployeeModel);
                return ctx.queryBus.run('employees-by-id', query, args);
            },
        },
        Mutation: {
            createEmployee(root: any, args, ctx: IGraphqlContext) {
            let mutation = new CreateEmployeeMutation(ctx.req.identity, ctx.req.appContext.EmployeeModel);
            return ctx.mutationBus.run < IMutationResponse > ('create-employee', ctx.req, mutation, args);
                      },
            updateEmployee(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateEmployeeMutation(ctx.req.identity, ctx.req.appContext.EmployeeModel);
                return ctx.mutationBus.run < IMutationResponse > ('update-employee', ctx.req, mutation, args);
            },
            deleteEmployee(root: any, args, ctx: IGraphqlContext) {
                let mutation = new DeleteEmployeeMutation(ctx.req.identity, ctx.req.appContext.EmployeeModel);
                return ctx.mutationBus.run < IMutationResponse > ('delete-employee', ctx.req, mutation, args);
            },
        },
    }
};