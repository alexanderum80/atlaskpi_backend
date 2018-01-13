import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';


@input()
export class SalesInput  {
    @field({ type: GraphQLTypesMap.String })
    source: string;

    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    location: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    customer: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    from: string;

    @field({ type: GraphQLTypesMap.String })
    to: string;

    @field({ type: GraphQLTypesMap.String })
    employee: string;

}


@type()
export class Sale  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    source: string;

    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    location: string;

    @field({ type: GraphQLTypesMap.String })
    customer: string;

    @field({ type: GraphQLTypesMap.String })
    employee: string;

    @field({ type: GraphQLTypesMap.String })
    product: string;

    @field({ type: GraphQLTypesMap.String })
    category: string;

}


@type()
export class ActivitiesMutationResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Sale })
    entity?: Sale;

    @field({ type: ErrorDetails, isArray: true })
    errors?: ErrorDetails[];

}

