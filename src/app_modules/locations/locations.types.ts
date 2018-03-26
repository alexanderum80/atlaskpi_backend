import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';

@input()
export class OperationHoursInput  {
    @field({ type: GraphQLTypesMap.String })
    day: string;

    @field({ type: GraphQLTypesMap.String })
    from: string;

    @field({ type: GraphQLTypesMap.String })
    to: string;

    @field({ type: GraphQLTypesMap.String })
    fromAMPM: string;

    @field({ type: GraphQLTypesMap.String })
    toAMPM: string;
}

@type()
export class OperationHoursInfo  {

    @field({ type: GraphQLTypesMap.String })
    day: string;

    @field({ type: GraphQLTypesMap.String })
    from: string;

    @field({ type: GraphQLTypesMap.String })
    to: string;

    @field({ type: GraphQLTypesMap.String })
    fromAMPM: string;

    @field({ type: GraphQLTypesMap.String })
    toAMPM: string;

}

@input()
export class LocationInput  {
    @field({ type: GraphQLTypesMap.String, required: true })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String })
    businessunits: string;
    
    @field({ type: GraphQLTypesMap.String })
    street: string;
    
    @field({ type: GraphQLTypesMap.String })
    country: string;

    @field({ type: GraphQLTypesMap.String })
    city: string;
    
    @field({ type: GraphQLTypesMap.String })
    state: string;

    @field({ type: GraphQLTypesMap.String })
    zip: string;

    @field({ type: GraphQLTypesMap.String })
    timezone: string;
    
    @field({ type: OperationHoursInput, isArray: true })
    operhours: OperationHoursInput[];

    @field({ type: GraphQLTypesMap.String, isArray: true })
    tags: string[];

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
    businessunits: string;

    @field({ type: GraphQLTypesMap.String })
    street: string;

    @field({ type: GraphQLTypesMap.String })
    country: string;

    @field({ type: GraphQLTypesMap.String })
    city: string;

    @field({ type: GraphQLTypesMap.String })
    state: string;

    @field({ type: GraphQLTypesMap.String })
    zip: string;

    @field({ type: GraphQLTypesMap.String })
    timezone: string;

    @field({ type: OperationHoursInfo, isArray: true })
    operhours: OperationHoursInfo[];

    @field({ type: GraphQLTypesMap.String, isArray: true })
    tags: string[];

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

