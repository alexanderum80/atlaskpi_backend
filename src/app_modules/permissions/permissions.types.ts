import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';

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

