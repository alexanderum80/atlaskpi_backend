
import { input, type, field, GraphQLTypesMap, ErrorDetails } from '../../framework';


@type()
export class BusinessUnit  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    serviceType: string;

}


@type()
export class UpdateBusinessUnitResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: BusinessUnit })
    entity: BusinessUnit;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class CreateBusinessUnitResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: BusinessUnit })
    entity: BusinessUnit;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class DeleteBusinessUnitResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: BusinessUnit })
    entity: BusinessUnit;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

