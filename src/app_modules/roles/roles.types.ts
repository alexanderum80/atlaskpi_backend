import { type } from '../../framework/decorators/type.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { Permission } from '../permissions/permissions.types';

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

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}

