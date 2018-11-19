import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';


@input()
export class ScheduleJobModelInfoInput {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    id: string;
}

@input()
export class ScheduleJobInput {
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

    @field({ type: ScheduleJobModelInfoInput })
    modelAlert: ScheduleJobModelInfoInput;
}

@type()
export class ScheduleJobModelInfoResponse {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    id: string;
}

@type()
export class ScheduleJobResponse {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

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

    @field({ type: ScheduleJobModelInfoResponse })
    modelAlert: ScheduleJobModelInfoResponse;
}

@type()
export class ScheduleJobMutationResponse {
    @field({ type: ScheduleJobResponse })
    entity: ScheduleJobResponse;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;
}
