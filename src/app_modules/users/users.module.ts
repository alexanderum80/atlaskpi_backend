import {
    AllUsersQuery,
    IsEnrollmentTokenValidQuery,
    IsResetPasswordTokenValidQuery,
    UserQuery,
    UsersQuery
} from './queries';
import {
    AddMobileDeviceMutation,
    CreateUserMutation,
    RemoveMobileDeviceMutation,
    RemoveUserMutation,
    ResetPasswordMutation,
    UpdateUserMutation,
    UserForgotPasswordMutation,
} from './mutations';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        AddMobileDeviceMutation,
        CreateUserMutation,
        RemoveMobileDeviceMutation,
        RemoveUserMutation,
        ResetPasswordMutation,
        UpdateUserMutation,
        UserForgotPasswordMutation
    ],
    queries: [
        AllUsersQuery,
        IsEnrollmentTokenValidQuery,
        IsResetPasswordTokenValidQuery,
        UserQuery,
        UsersQuery
    ]
})
export class UsersModule extends ModuleBase { }