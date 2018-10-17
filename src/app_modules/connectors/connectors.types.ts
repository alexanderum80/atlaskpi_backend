import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';

@type()
export class Connector  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.Boolean })
    active: boolean;

    @field({ type: GraphQLTypesMap.String })
    type: string;
}


@type()
export class ConnectorResult {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: GraphQLTypesMap.String })
    entity: string;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}

