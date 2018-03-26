import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';


@input()
export class AlertInput {
    @field({ type: GraphQLTypesMap.String, isArray: true })
    notify: String[];

    @field({ type: GraphQLTypesMap.String })
    frequency: String;

    @field({ type: GraphQLTypesMap.Boolean })
    active: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    push_notification: boolean;

    @field({ type: GraphQLTypesMap.String })
    modelName: string;

    @field({ type: GraphQLTypesMap.String })
    modelId: string;
}

@type()
export class AlertResponse {
    @field({ type: GraphQLTypesMap.String, isArray: true })
    notify: String[];

    @field({ type: GraphQLTypesMap.String })
    frequency: String;

    @field({ type: GraphQLTypesMap.Boolean })
    active: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    push_notification: boolean;

    @field({ type: GraphQLTypesMap.String })
    modelName: string;

    @field({ type: GraphQLTypesMap.String })
    modelId: string;
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
