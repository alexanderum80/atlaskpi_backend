import { type } from '../../framework/decorators/type.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { Role } from '../roles/roles.types';
import { PaginationInfo } from '../shared/shared.types';


@input()
export class UserDetails  {
    @field({ type: GraphQLTypesMap.String })
    firstName: string;

    @field({ type: GraphQLTypesMap.String })
    middleName: string;

    @field({ type: GraphQLTypesMap.String })
    lastName: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    email: string;

    @field({ type: GraphQLTypesMap.String, required: true, isArray: true })
    roles: string[];

}


@input()
export class AddMobileDeviceDetails  {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    network: string;

    @field({ type: GraphQLTypesMap.String })
    token: string;

}


@input()
export class InputUserProfile  {
    @field({ type: GraphQLTypesMap.String })
    firstName: string;

    @field({ type: GraphQLTypesMap.String })
    middleName: string;

    @field({ type: GraphQLTypesMap.String })
    lastName: string;

    @field({ type: GraphQLTypesMap.String })
    sex: string;

    @field({ type: GraphQLTypesMap.String })
    dob: string;

}

@input()
export class ITourChart {
    @field({ type: GraphQLTypesMap.Boolean })
    showTour: boolean;
}


@input()
export class ITourInput {
    @field({ type: ITourChart })
    chart: ITourChart;
}


@type()
export class UserEmail  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    address: string;

    @field({ type: GraphQLTypesMap.Boolean })
    verified: boolean;

}


@type()
export class UserLoginToken  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    when: string;

    @field({ type: GraphQLTypesMap.String })
    hashedToken: string;

    @field({ type: GraphQLTypesMap.String })
    clientId: string;

}


@type()
export class UserEmailedToken  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    token: string;

    @field({ type: GraphQLTypesMap.String })
    email: string;

    @field({ type: GraphQLTypesMap.String })
    when: string;

}


@type()
export class PasswordReset  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: UserEmailedToken })
    reset: UserEmailedToken;

}


@type()
export class UserServiceEmail  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: UserEmailedToken, isArray: true })
    verificationTokens: UserEmailedToken[];

}


@type()
export class UserServices  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: UserLoginToken, isArray: true })
    loginTokens: UserLoginToken[];

    @field({ type: PasswordReset })
    password: PasswordReset;

    @field({ type: UserServiceEmail })
    email: UserServiceEmail;

}


@type()
export class UserProfile  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    firstName: string;

    @field({ type: GraphQLTypesMap.String })
    middleName: string;

    @field({ type: GraphQLTypesMap.String })
    lastName: string;

    @field({ type: GraphQLTypesMap.String })
    sex: string;

    @field({ type: GraphQLTypesMap.String })
    dob: string;

}

@type()
export class ChartPreference {
    @field({ type: GraphQLTypesMap.Boolean })
    showTour: boolean;
}

@type()
export class UserPreference {
    @field({ type: ChartPreference })
    chart: ChartPreference;
}

@type()
export class User  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    username: string;

    @field({ type: UserEmail, isArray: true })
    emails: UserEmail[];

    @field({ type: UserProfile })
    profile: UserProfile;

    @field({ type: UserPreference })
    preferences: UserPreference;

    // TODO: Come back here because bridge was complaining here processing this field (something related to permission I think)
    @field({ type: Role, isArray: true })
    roles: Role[];

    @field({ type: GraphQLTypesMap.String })
    timestamps: string;

    @field({ type: GraphQLTypesMap.String })
    firstLogin: string;

}


@type()
export class TokenVerification  {
    @field({ type: GraphQLTypesMap.Boolean })
    isValid: boolean;

    @field({ type: UserProfile })
    profile: UserProfile;

}


@type()
export class ValidationError  {
    @field({ type: GraphQLTypesMap.String })
    field: string;

}


@type()
export class CreateUserResult  {
    @field({ type: User })
    user: User;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

@type()
export class ErrorSuccessResult {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: ErrorDetails, isArray: true })
    errors?: ErrorDetails[];

    @field({ type: User })
    entity?: User;
}


@type()
export class UserPagedQueryResult  {
    @field({ type: PaginationInfo })
    pagination: PaginationInfo;

    @field({ type: User, isArray: true })
    data: User[];

}


@type()
export class UserResult  {
    @field({ type: User })
    user: User;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

