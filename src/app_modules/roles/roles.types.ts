
import { input, type, field, GraphQLTypesMap } from '../../framework';

@type()
export class Role  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: Permission, isArray: true })
    permissions: Permission[];

}

@input()
export class RoleDetailsInput  {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    permissions: string[];

}


@type()
export class RoleList  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    permissions: string[];

    @field({ type: GraphQLTypesMap.String })
    timestamp: string;

}


@type()
export class RoleResult  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: User, isArray: true })
    entity: User[];

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

