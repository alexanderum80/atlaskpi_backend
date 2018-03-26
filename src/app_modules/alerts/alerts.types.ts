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
    notify: String[];

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
export class AlertInput {
    @field({ type: AlertInfoInput, isArray: true, required: true })
    alertInfo: AlertInfoInput[];

    @field({ type: GraphQLTypesMap.String })
    model_name: string;

    @field({ type: GraphQLTypesMap.String })
    model_id: string;
}

@type()
export class AlertInfoResponse {
    @field({ type: GraphQLTypesMap.String })
    notify: String;

    @field({ type: GraphQLTypesMap.String })
    frequency: String;

    @field({ type: GraphQLTypesMap.Boolean })
    active: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    push_notification: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    email_notified: boolean;

    @resolver({ forField: 'notify' })
    static resolveNotify = (entity: IAlert) => entity.notify.join('|')
}

@type()
export class AlertResponse {
    @field({ type: AlertInfoResponse, isArray: true })
    alertInfo: AlertInfoResponse[];

    @field({ type: GraphQLTypesMap.String })
    model_name: string;

    @field({ type: GraphQLTypesMap.String })
    model_id: string;
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
