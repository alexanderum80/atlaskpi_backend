import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';


@input()
export class AlertModelInfoInput {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    id: string;
}

@input()
export class AlertInput {
    @field({ type: GraphQLTypesMap.String, isArray: true, required: true })
    notifyUsers: String[];

    @field({ type: GraphQLTypesMap.String, required: true })
    frequency: String;

    @field({ type: GraphQLTypesMap.Boolean, required: true })
    active: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    pushNotification: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    emailNotified: boolean;

    @field({ type: AlertModelInfoInput })
    modelAlert: AlertModelInfoInput;
}

@type()
export class AlertModelInfoResponse {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    id: string;
}

@type()
export class AlertResponse {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    notifyUsers: String[];

    @field({ type: GraphQLTypesMap.String })
    frequency: String;

    @field({ type: GraphQLTypesMap.Boolean })
    active: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    pushNotification: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    emailNotified: boolean;

    @field({ type: AlertModelInfoResponse })
    modelAlert: AlertModelInfoResponse;
}

@type()
export class AlertMutationResponse {
    @field({ type: AlertResponse })
    entity: AlertResponse;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;
}
