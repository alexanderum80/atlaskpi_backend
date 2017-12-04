import { GetRolesQuery } from './queries';
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
        GetRolesQuery
    ]
})
export class Module extends ModuleBase { }