import { FindAllRolesQuery } from './queries/find-all-roles.query';
import { CreateRoleMutation, RemoveRoleMutation, UpdateRoleMutation } from './mutations';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateRoleMutation,
        RemoveRoleMutation,
        UpdateRoleMutation
    ],
    queries: [
        FindAllRolesQuery
    ]
})
export class RolesModule extends ModuleBase { }