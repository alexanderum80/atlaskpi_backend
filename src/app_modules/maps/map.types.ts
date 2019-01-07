import { ChartDateRangeInput, ChartDateRange } from './../shared/shared.types';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';
import { input } from '../../framework/decorators/input.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { resolver } from '../../framework/decorators/resolver.decorator';


@input()
export class MapMarkerGroupingInput {
    @field({ type: GraphQLTypesMap.String })
    dateRange: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    grouping: string[];

    @field({ type: GraphQLTypesMap.String })
    kpi: string;
}

@input()
export class MapAttributesInput  {
    @field({ type: GraphQLTypesMap.String, required: true })
    title: string;

    @field({ type: GraphQLTypesMap.String })
    subtitle: string;

    @field({ type: GraphQLTypesMap.String })
    group: string;

    @field({ type: ChartDateRangeInput })
    dateRange: ChartDateRangeInput;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings: string[];

    @field({ type: GraphQLTypesMap.String, isArray: true })
    dashboards: string[];

    @field({ type: GraphQLTypesMap.String})
    size: string;

    @field({ type: GraphQLTypesMap.String})
    kpi: string;

    @field({ type: GraphQLTypesMap.String })
    zipCodeSource: string;

    //add-created-update-by-date
    @field({ type: GraphQLTypesMap.String })
    createdBy?: string;

    @field({ type: GraphQLTypesMap.String })
    updatedBy?: string;

    @field({ type: GraphQLTypesMap.Date })
    createdDate?: Date;

    @field({ type: GraphQLTypesMap.Date })
    updatedDate?: Date;
}

@type()
export class MapMarkerItemList {
    @field({ type: GraphQLTypesMap.Float })
    amount: number;

    @field({ type: GraphQLTypesMap.String })
    groupName: string;

    @resolver({ forField: 'groupName' })
    static groupNameResolver(itemList) {
        return itemList.groupName.toString();
    }
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
    groupingName?: string;

    @field({ type: MapMarkerItemList, isArray: true })
    itemList?: MapMarkerItemList[];
}
@type()
export class MapEntityResponse  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    title: string;

    @field({ type: GraphQLTypesMap.String })
    subtitle: string;

    @field({ type: GraphQLTypesMap.String })
    group: string;

    @field({ type: GraphQLTypesMap.String })
    kpi: string;

    @field({ type: ChartDateRange })
    dateRange: ChartDateRange;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings: string[];

    @field({ type: GraphQLTypesMap.String, isArray: true })
    dashboards: string[];

    @field({ type: GraphQLTypesMap.String })
    zipCodeSource: string;

    //add-created-update-by-date
    @field({ type: GraphQLTypesMap.String })
    createdBy?: string;

    @field({ type: GraphQLTypesMap.String })
    updatedBy?: string;

    @field({ type: GraphQLTypesMap.Date })
    createdDate?: Date;

    @field({ type: GraphQLTypesMap.Date })
    updatedDate?: Date;
}

@type()
export class MapMutationResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: MapEntityResponse })
    entity: MapEntityResponse;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}

@type()
export class ListMapsQueryResponse  {
    @field({ type: MapEntityResponse, isArray: true })
    data: MapEntityResponse[];

    // @this.resolver({ forField: 'data' })
    // static resolveData = data => data
}