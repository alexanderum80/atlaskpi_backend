
import { input, type, field, GraphQLTypesMap, ErrorDetails } from '../../framework';


@input()
export class AppointmentInput  {
    @field({ type: GraphQLTypesMap.String })
    source: string;

    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    fullName: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    reason: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    from: string;

    @field({ type: GraphQLTypesMap.String })
    to: string;

    @field({ type: GraphQLTypesMap.String })
    provider: string;

    @field({ type: GraphQLTypesMap.String })
    state: string;

}


@type()
export class Appointment  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    source: string;

    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    fullName: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    reason: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    from: string;

    @field({ type: GraphQLTypesMap.String })
    to: string;

    @field({ type: GraphQLTypesMap.String })
    provider: string;

    @field({ type: GraphQLTypesMap.String })
    state: string;

}


@type()
export class AppointmentMutationResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Appointment })
    entity?: Appointment;

    @field({ type: ErrorDetails, isArray: true })
    errors?: ErrorDetails[];

}

