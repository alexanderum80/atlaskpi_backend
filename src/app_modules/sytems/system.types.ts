import { type } from '../../framework/decorators/type.decorator';
import { input } from '../../framework/decorators/input.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { ErrorDetails } from '../../framework/graphql/common.types';

@input()
export class SystemInput  {
    @field({ type: GraphQLTypesMap.String })
    section: string;

    @field({ type: GraphQLTypesMap.String })
    system: string;

    @field({ type: GraphQLTypesMap.String })
    image: string;

}


@type()
export class System  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    section: string;

    @field({ type: GraphQLTypesMap.String })
    system: string;

    @field({ type: GraphQLTypesMap.String })
    image: string;

}



@type()
export class UpdateSystemResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: System })
    entity: System;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class CreateSystemResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: System })
    entity: System;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class DeleteSystemResponse  {
    @field({ type: GraphQLTypesMap.String })
    success: string;

    @field({ type: System })
    entity: System;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

