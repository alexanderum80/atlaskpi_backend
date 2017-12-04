import {
    FindAllUsersQuery,
    FindUserByIdQuery,
    SearchUsersQuery,
    VerifyEnrollmentQuery,
    VerifyResetPasswordQuery,
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
        FindAllUsersQuery,
        FindUserByIdQuery,
        SearchUsersQuery,
        VerifyEnrollmentQuery,
        VerifyResetPasswordQuery
    ]
})
export class UsersModule extends ModuleBase { }