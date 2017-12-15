import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateEmployeeMutation } from './mutations/create-employee.mutation';
import { DeleteEmployeeMutation } from './mutations/delete-employee.mutation';
import { UpdateEmployeeMutation } from './mutations/update-employee.mutation';
import { EmployeeByIdQuery } from './queries/employee-by-id.query';
import { EmployeesQuery } from './queries/employees.query';


@AppModule({
    mutations: [
        CreateEmployeeMutation,
        DeleteEmployeeMutation,
        UpdateEmployeeMutation
    ],
    queries: [
        EmployeeByIdQuery,
        EmployeesQuery
    ]
})
export class EmployeesModule extends ModuleBase { }