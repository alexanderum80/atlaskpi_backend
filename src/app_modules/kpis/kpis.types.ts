
import { input, type, field, GraphQLTypesMap, ErrorDetails } from '../../framework';
import { PaginationInfo, ChartDateRangeInput, ChartDateRange } from '../shared';
import { ChartEntityResponse } from '../charts/charts.types';

@input()
export class KPIAttributesInput  {
    @field({ type: GraphQLTypesMap.String })
    code: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    group: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: ChartDateRangeInput })
    dateRange: ChartDateRangeInput;

    @field({ type: GraphQLTypesMap.String })
    frequency: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings: string[];

    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.String })
    expression: string;

    @field({ type: GraphQLTypesMap.String })
    filter: string;

}


@type()
export class KPIRemoveResponse  {
    @field({ type: ChartEntityResponse, isArray: true })
    entity: ChartEntityResponse[];

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

}


@type()
export class KPI  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    code: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    baseKpi: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String })
    group: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings: string[];

    @field({ type: ChartDateRange })
    dateRange: ChartDateRange;

    @field({ type: GraphQLTypesMap.String })
    filter: string;

    @field({ type: GraphQLTypesMap.String })
    frequency: string;

    @field({ type: GraphQLTypesMap.String })
    axisSelection: string;

    @field({ type: GraphQLTypesMap.String })
    emptyValueReplacement: string;

    @field({ type: GraphQLTypesMap.String })
    expression: string;

    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    availableGroupings: string[];

}



@type()
export class KPIMutationResponse  {
    @field({ type: KPI })
    entity: KPI;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

}


@type()
export class KPIPagedQueryResult  {
    @field({ type: PaginationInfo })
    pagination: PaginationInfo;

    @field({ type: KPI, isArray: true })
    data: KPI[];

}

