import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateRoleMutation } from './mutations/create-role.mutation';
import { RemoveRoleMutation } from './mutations/remove-role.mutation';
import { UpdateRoleMutation } from './mutations/update-role.mutation';
import { FindAllRolesQuery } from './queries/find-all-roles.query';
import { RoleByNameQuery } from './queries/role-by-name.query';


@AppModule({
    mutations: [
        CreateRoleMutation,
        RemoveRoleMutation,
        UpdateRoleMutation
    ],
    queries: [
        FindAllRolesQuery,
        RoleByNameQuery
    ]
})
export class RolesModule extends ModuleBase { }