import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';

@input()
export class PersonalInfoDetails {
    @field({ type: GraphQLTypesMap.String })
    fullname: string;

    @field({ type: GraphQLTypesMap.String })
    email: string;
}

@input()
export class AccountDetails {
    @field({ type: GraphQLTypesMap.String, required: true })
    name: string;

    @field({ type: PersonalInfoDetails })
    personalInfo: PersonalInfoDetails;

    @field({ type: GraphQLTypesMap.Boolean })
    seedData: boolean;

    @field({ type: GraphQLTypesMap.String })
    authorizationCode: string;
}


@type()
export class PersonalInfo {
    @field({ type: GraphQLTypesMap.String })
    fullname: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    email: string;
}

@type()
export class BusinessInfo {
    @field({ type: GraphQLTypesMap.Int })
    numberOfLocations: number;

    @field({ type: GraphQLTypesMap.String })
    country: string;

    @field({ type: GraphQLTypesMap.String })
    phoneNumber: string;
}

@type()
export class UserToken {
    @field({ type: GraphQLTypesMap.String })
    issued: string;

    @field({ type: GraphQLTypesMap.String })
    expires: string;

    @field({ type: GraphQLTypesMap.String })
    access_token: string;
}

@type()
export class Account {
    @field({ type: GraphQLTypesMap.String })
    _id: String;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: PersonalInfo })
    personalInfo: PersonalInfo;

    @field({ type: BusinessInfo })
    businessInfo: BusinessInfo;

    @field({ type: GraphQLTypesMap.String, required: true })
    subdomain: string;

    @field({ type: UserToken })
    initialToken: UserToken;
}

@type()
export class AccountResult {
    @field({ type: Account })
    entity: Account;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}