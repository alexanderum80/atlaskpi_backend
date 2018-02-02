import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateDepartmentMutation } from './mutations/create-department.mutation.new';
import { DeleteDepartmentMutation } from './mutations/delete-department.mutation.new';
import { UpdateDepartmentMutation } from './mutations/update-department.mutation.new';
import { DepartmentByIdQuery } from './queries/department-by-id.query';
import { DepartmentsQuery } from './queries/departments.query';


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
export class DepartmentsModule extends ModuleBase { }