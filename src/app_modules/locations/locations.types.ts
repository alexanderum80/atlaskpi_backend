
import { input, type, field, GraphQLTypesMap, ErrorDetails } from '../../framework';


@input()
export class ILocationInput  {
    @field({ type: GraphQLTypesMap.String, required: true })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String })
    alias: string;

    @field({ type: GraphQLTypesMap.String })
    businessunits: string;

    @field({ type: GraphQLTypesMap.String })
    operhours: string;

    @field({ type: GraphQLTypesMap.String })
    street: string;

    @field({ type: GraphQLTypesMap.String })
    city: string;

    @field({ type: GraphQLTypesMap.String })
    state: string;

    @field({ type: GraphQLTypesMap.String })
    zip: string;

}


@type()
export class Location  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String })
    alias: string;

    @field({ type: GraphQLTypesMap.String })
    businessunits: string;

    @field({ type: GraphQLTypesMap.String })
    operhours: string;

    @field({ type: GraphQLTypesMap.String })
    street: string;

    @field({ type: GraphQLTypesMap.String })
    city: string;

    @field({ type: GraphQLTypesMap.String })
    state: string;

    @field({ type: GraphQLTypesMap.String })
    zip: string;

}


@type()
export class UpdateLocationResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Location })
    entity: Location;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class CreateLocationResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Location })
    entity: Location;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class DeleteLocationResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Location })
    entity: Location;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

