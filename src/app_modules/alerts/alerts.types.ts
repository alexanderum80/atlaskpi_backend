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
export class INotificationUsers {
    @field({ type: GraphQLTypesMap.String, required: true })
    identifier: String;
    @field({ type: GraphQLTypesMap.String, isArray: true, required: true })
    deliveryMethods: String[];
}

@type()
export class ONotificationUsers {
    @field({ type: GraphQLTypesMap.String, required: true })
    identifier: String;
    @field({ type: GraphQLTypesMap.String, isArray: true, required: true })
    deliveryMethods: String[];
}

@input()
export class AlertInput {
    @field({ type: GraphQLTypesMap.String, required: true })
    name: String;
    @field({ type: GraphQLTypesMap.String, required: true })
    kpi: String;
    @field({ type: GraphQLTypesMap.String, required: true })
    frequency: String;
    @field({ type: GraphQLTypesMap.String, required: true })
    condition: String;
    @field({ type: GraphQLTypesMap.Float, required: true })
    value: Number;
    @field({ type: GraphQLTypesMap.Boolean, required: true })
    active: Boolean;
    @field({ type: INotificationUsers, isArray: true, required: true })
    users: INotificationUsers[];
    @field({ type: GraphQLTypesMap.String})
    createdBy: String;
    @field({ type: GraphQLTypesMap.Date})
    createdAt: Date;
    @field({ type: GraphQLTypesMap.String})
    updatedBy: String;
    @field({ type: GraphQLTypesMap.Date})
    updatedDate: Date;

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
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;
    @field({ type: GraphQLTypesMap.String, required: true })
    name: String;
    @field({ type: GraphQLTypesMap.String, required: true })
    kpi: String;
    @field({ type: GraphQLTypesMap.String, required: true })
    frequency: String;
    @field({ type: GraphQLTypesMap.String, required: true })
    condition: String;
    @field({ type: GraphQLTypesMap.Float, required: true })
    value: Number;
    @field({ type: GraphQLTypesMap.Boolean })
    active: Boolean;
    @field({ type: ONotificationUsers, isArray: true, required: true })
    users: ONotificationUsers[];
    @field({ type: GraphQLTypesMap.String})
    createdBy: String;
    @field({ type: GraphQLTypesMap.Date})
    createdAt: Date;
    @field({ type: GraphQLTypesMap.String})
    updatedBy: String;
    @field({ type: GraphQLTypesMap.Date})
    updatedDate: Date;

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
