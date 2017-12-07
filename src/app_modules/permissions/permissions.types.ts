
import { input, type, field, GraphQLTypesMap } from '../../framework';


@type()
export class Permission  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    action: string;

    @field({ type: GraphQLTypesMap.String })
    subject: string;

}

@type()
export class PermissionInfo  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    action: string;

    @field({ type: GraphQLTypesMap.String })
    subject: string;

}

