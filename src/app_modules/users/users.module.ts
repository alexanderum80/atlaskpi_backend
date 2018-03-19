import { UpdateUserAgreementMutation } from './mutations/update-user-agreement.mutation';
import { FindUserByUsername } from './queries/find-user-by-username.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { AddMobileDeviceMutation } from './mutations/add-mobile-device.mutation';
import { CreateUserMutation } from './mutations/create-user.mutation';
import { RemoveMobileDeviceMutation } from './mutations/remove-mobile-device.mutation';
import { RemoveUserMutation } from './mutations/remove-user.mutation';
import { ResetPasswordMutation } from './mutations/reset-password.mutation';
import { UpdateUserMutation } from './mutations/update-user.mutation';
import { UserForgotPasswordMutation } from './mutations/user-forgot-password.mutation';
import { UpdateUserPreferenceMutation } from './mutations/update-user-preference.mutation';
import { AllUsersQuery } from './queries/all-users.query';
import { IsEnrollmentTokenValidQuery } from './queries/is-enrollment-token-valid.query';
import { IsResetPasswordTokenValidQuery } from './queries/is-reset-password-token-valid.query';
import { UserQuery } from './queries/user.query';
import { UsersQuery } from './queries/users.query';
import { FindByFullNameQuery } from './queries/user-by-fullName.query';
import { UserHelpCenterQuery } from './queries/user-help-center.query';


@AppModule({
    mutations: [
        AddMobileDeviceMutation,
        CreateUserMutation,
        RemoveMobileDeviceMutation,
        RemoveUserMutation,
        ResetPasswordMutation,
        UpdateUserMutation,
        UserForgotPasswordMutation,
        UpdateUserPreferenceMutation,
        UpdateUserAgreementMutation
    ],
    queries: [
        AllUsersQuery,
        IsEnrollmentTokenValidQuery,
        IsResetPasswordTokenValidQuery,
        UserQuery,
        UsersQuery,
        FindByFullNameQuery,
        FindUserByUsername,
        UserHelpCenterQuery
    ]
})
export class UsersModule extends ModuleBase { }