import { type } from '../../framework/decorators/type.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { Role } from '../roles/roles.types';
import { PaginationInfo } from '../shared/shared.types';
import {resolver} from '../../framework/decorators/resolver.decorator';
import {IUserPreference} from '../../domain/app/security/users/user';


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

    @field({ type: GraphQLTypesMap.String })
    timezone: string;

    @field({ type: GraphQLTypesMap.String, required: true, isArray: true })
    roles: string[];

}

@input()
export class UserProfileInput {
    @field({ type: GraphQLTypesMap.String })
    firstName: string;

    @field({ type: GraphQLTypesMap.String })
    middleName: string;

    @field({ type: GraphQLTypesMap.String })
    lastName: string;

    @field({ type: GraphQLTypesMap.String })
    phoneNumber: string;

    @field({ type: GraphQLTypesMap.String })
    timezone: string;

    @field({ type: GraphQLTypesMap.Boolean })
    general: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    chat: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    viaEmail: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    dnd: boolean;
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

    @field({ type: GraphQLTypesMap.String })
    phoneNumber: string;

}

@input()
export class ITourChart {
    @field({ type: GraphQLTypesMap.Boolean })
    showTour: boolean;
}

@input()
export class IListView {
    @field({ type: GraphQLTypesMap.String })
    listMode: string;
}


@input()
export class UserPreferencesInput {
    @field({ type: ITourChart })
    chart: ITourChart;

    @field({ type: GraphQLTypesMap.Boolean })
    helpCenter: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    showAppointmentCancelled: boolean;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    providers: string[];

    @field({ type: GraphQLTypesMap.String, isArray: true })
    resources: string[];

    @field({ type: GraphQLTypesMap.String })
    calendarTimeZone: string;

    @field({ type: GraphQLTypesMap.String })
    mobileCalendar: string;   // classic | modern

    @field({ type: GraphQLTypesMap.String })
    dashboardIdNoVisible: string[];

    @field({ type: GraphQLTypesMap.String })
    atlasSheetsIdNoVisible: string[];

    @field({ type: IListView })
    dashboards: IListView;

    @field({ type: IListView})
    charts: IListView;

    @field({ type: IListView})
    kpis: IListView;

    @field({ type: IListView})
    roles: IListView;

    @field({ type: IListView})
    users: IListView;

    @field ({ type: GraphQLTypesMap.String })
    theme: string;
}

@input()
export class UserAgreementInput {
    @field({ type: GraphQLTypesMap.String })
    email: string;

    @field({ type: GraphQLTypesMap.Boolean })
    accept: boolean;
}


@type()
export class UserEmail  {
    @field({ type: GraphQLTypesMap.String })
    address: string;

    @field({ type: GraphQLTypesMap.Boolean })
    verified: boolean;

}


@type()
export class UserLoginToken  {
    @field({ type: GraphQLTypesMap.String })
    when: string;

    @field({ type: GraphQLTypesMap.String })
    hashedToken: string;

    @field({ type: GraphQLTypesMap.String })
    clientId: string;

}


@type()
export class UserEmailedToken  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

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
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: UserEmailedToken })
    reset: UserEmailedToken;

}


@type()
export class UserServiceEmail  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: UserEmailedToken, isArray: true })
    verificationTokens: UserEmailedToken[];

}


@type()
export class UserServices  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

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
export class UserAgreement {
    @field({ type: GraphQLTypesMap.Boolean })
    accept: boolean;

    @field({ type: GraphQLTypesMap.String })
    ipAddress: string;

    @field({ type: GraphQLTypesMap.String })
    timestamp: Date;
}


@type()
export class UserProfile  {
    @field({ type: GraphQLTypesMap.String })
    firstName: string;

    @field({ type: GraphQLTypesMap.String })
    middleName: string;

    @field({ type: GraphQLTypesMap.String })
    lastName: string;

    @field({ type: GraphQLTypesMap.String })
    email: string;

    @field({ type: GraphQLTypesMap.String })
    sex: string;

    @field({ type: GraphQLTypesMap.String })
    dob: string;

    @field({ type: GraphQLTypesMap.String })
    phoneNumber: string;

    @field({ type: UserAgreement })
    agreement: UserAgreement;

    @field({ type: GraphQLTypesMap.String })
    timezone: string;

}

@type()
export class ChartPreference {
    @field({ type: GraphQLTypesMap.Boolean })
    showTour: boolean;
}

@type()
export class ListViewPreference {
    @field({ type: GraphQLTypesMap.String })
    listMode: string;
}

@type()
export class UserNotifications {
    @field({ type: GraphQLTypesMap.Boolean })
    general: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    chat: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    email: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    dnd: boolean;
}


@type()
export class UserPreference {
    @field({ type: ChartPreference })
    chart: ChartPreference;

    @field({ type:  GraphQLTypesMap.Boolean })
    helpCenter: boolean;

    @field({type: UserNotifications })
    notification: UserNotifications;

    @field({ type: GraphQLTypesMap.String })
    avatarAddress: string;

    @field({ type: GraphQLTypesMap.Boolean })
    showAppointmentCancelled: boolean;

    @field({ type: GraphQLTypesMap.String })
    providers: string;

    @field({ type: GraphQLTypesMap.String })
    resources: string;

    @field({ type: GraphQLTypesMap.String })
    mobileCalendar: string;   // classic | modern

    @field({ type: GraphQLTypesMap.String })
    calendarTimeZone: string;

    @field({ type: GraphQLTypesMap.String })
    dashboardIdNoVisible: string;

    @field({ type: GraphQLTypesMap.String })
    atlasSheetsIdNoVisible: string;

    @field({ type: ListViewPreference })
    dashboards: ListViewPreference;

    @field({ type: ListViewPreference })
    charts: ListViewPreference;

    @field({ type: ListViewPreference })
    kpis: ListViewPreference;

    @field({ type: ListViewPreference })
    roles: ListViewPreference;

    @field({ type: ListViewPreference })
    users: ListViewPreference;

    @field ({ type: GraphQLTypesMap.String })
    theme: string;

    @resolver({ forField: 'providers' })
    static resolveProviders = (entity: IUserPreference) => entity.providers.join('|')

    @resolver({ forField: 'resources' })
    static resolveResources = (entity: IUserPreference) => entity.resources.join('|')

    @resolver({ forField: 'dashboardIdNoVisible' })
    static resolverdashboardIdNoVisible = (entity: IUserPreference) => {
        if (entity.dashboardIdNoVisible === undefined || entity.dashboardIdNoVisible.length === 0) {
             return undefined;
        } else {
            return entity.dashboardIdNoVisible.join('|');
        }
    }

    @resolver({ forField: 'atlasSheetsIdNoVisible' })
    static resolverAtlasSheetsIdNoVisible = (entity: IUserPreference) => {
        if (entity.atlasSheetsIdNoVisible === undefined || entity.atlasSheetsIdNoVisible.length === 0) {
             return undefined;
        } else {
            return entity.atlasSheetsIdNoVisible.join('|');
        }
    }
}

@type()
export class User  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

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
    profilePictureUrl: string;

    @field({ type: GraphQLTypesMap.Boolean })
    ownerAgreed?: boolean;
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
export class EditUserProfileResponse {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: User })
    entity: User;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}


@type()
export class UserResult  {
    @field({ type: User })
    user: User;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

@type()
export class UserProfileResolve {
    @field({ type: GraphQLTypesMap.String })
    firstName: string;

    @field({ type: GraphQLTypesMap.String })
    middleName: string;

    @field({ type: GraphQLTypesMap.String })
    lastName: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    email: string;

    @field({ type: GraphQLTypesMap.String })
    telephoneNumber: string;

    @field({ type: GraphQLTypesMap.Boolean })
    general: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    chat: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    emailNotification: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    dnd: boolean;
}
