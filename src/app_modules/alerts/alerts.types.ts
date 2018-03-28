import { IAlert } from '../../domain/app/alerts/alert';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';


@input()
export class AlertInfoInput {
    @field({ type: GraphQLTypesMap.String, isArray: true, required: true })
    notify_users: String[];

    @field({ type: GraphQLTypesMap.String, required: true })
    frequency: String;

    @field({ type: GraphQLTypesMap.Boolean, required: true })
    active: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    push_notification: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    email_notified: boolean;
}

@input()
export class AlertModelInfoInput {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    id: string;
}

@input()
export class AlertInput {
    @field({ type: AlertInfoInput, isArray: true, required: true })
    alertInfo: AlertInfoInput[];

    @field({ type: AlertModelInfoInput })
    model: AlertModelInfoInput;
}

@type()
export class AlertInfoResponse {
    @field({ type: GraphQLTypesMap.String })
    notify_users: String;

    @field({ type: GraphQLTypesMap.String })
    frequency: String;

    @field({ type: GraphQLTypesMap.Boolean })
    active: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    push_notification: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    email_notified: boolean;

    @resolver({ forField: 'notify_users' })
    static resolveNotify = (entity: IAlert) => entity.notify_users.join('|')
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

    @field({ type: AlertInfoResponse, isArray: true })
    alertInfo: AlertInfoResponse[];

    @field({ type: AlertModelInfoResponse })
    model: AlertModelInfoResponse;
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
