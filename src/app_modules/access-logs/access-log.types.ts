
import { input, type, field, GraphQLTypesMap, ErrorDetails } from '../../framework';

@input()
export class IResultEntry  {
    @field({ type: GraphQLTypesMap.Boolean, required: true })
    authorized: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    status: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    details: boolean;

}

@input()
export class IAccessLogInput  {
    @field({ type: GraphQLTypesMap.String })
    timestamp: string;

    @field({ type: GraphQLTypesMap.String })
    accessBy: string;

    @field({ type: GraphQLTypesMap.String })
    ipAddress: string;

    @field({ type: GraphQLTypesMap.String })
    clientDetails: string;

    @field({ type: GraphQLTypesMap.String })
    event: string;

    @field({ type: GraphQLTypesMap.String })
    eventType: string;

    @field({ type: GraphQLTypesMap.String })
    payload: string;

    @field({ type: IResultEntry })
    result: IResultEntry;

}


@type()
export class ResultResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    authorized: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    status: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    details: boolean;

}


@type()
export class AccessLogResponse  {
    @field({ type: GraphQLTypesMap.String })
    timestamp: string;

    @field({ type: GraphQLTypesMap.String })
    accessBy: string;

    @field({ type: GraphQLTypesMap.String })
    ipAddress: string;

    @field({ type: GraphQLTypesMap.String })
    clientDetails: string;

    @field({ type: GraphQLTypesMap.String })
    event: string;

    @field({ type: GraphQLTypesMap.String })
    eventType: string;

    @field({ type: GraphQLTypesMap.String })
    payload: string;

}


@type()
export class AccessLogResult  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: AccessLogResponse })
    entity: AccessLogResponse;

    @field({ type: ErrorDetails, isArray: true })
    error: ErrorDetails;

}

