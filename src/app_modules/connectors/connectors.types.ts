import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { resolver } from '../../framework/decorators/resolver.decorator';

@type()
export class Connector  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

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

    @field({ type: Connector })
    entity: Connector;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}

