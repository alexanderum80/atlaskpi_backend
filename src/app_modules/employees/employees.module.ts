import { EmployeeByIdQuery, EmployeesQuery } from './queries';
import { CreateEmployeeMutation, DeleteEmployeeMutation, UpdateEmployeeMutation } from './mutations';
import {
    AppModule, ModuleBase
} from '../../framework';

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