import { DepartmentsQuery } from './queries/departments.query';
import { DepartmentByIdQuery } from './queries/department-by-id.query';
import { UpdateDepartmentMutation } from './mutations/update-department.mutation';
import { DeleteDepartmentMutation } from './mutations/delete-department.mutation';
import { CreateDepartmentMutation } from './mutations/create-department.mutation';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateDepartmentMutation,
        DeleteDepartmentMutation,
        UpdateDepartmentMutation
    ],
    queries: [
        DepartmentByIdQuery,
        DepartmentsQuery
    ]
})
export class Module extends ModuleBase { }