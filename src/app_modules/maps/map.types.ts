import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';
import { input } from '../../framework/decorators/input.decorator';
import { Permission } from '../permissions/permissions.types';

@input()
export class MapMarkerGroupingInput {
    @field({ type: GraphQLTypesMap.String })
    dateRange: string;

    @field({ type: GraphQLTypesMap.String })
    grouping: string;
}

@type()
export class MapMarker  {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.Float })
    lat: number;

    @field({ type: GraphQLTypesMap.Float })
    lng: number;

    @field({ type: GraphQLTypesMap.String })
    color: string;

    @field({ type: GraphQLTypesMap.Float })
    value: number;

    @field({ type: GraphQLTypesMap.String })
    grouping: string;

    @field({ type: GraphQLTypesMap.String })
    groupingName: string;
}