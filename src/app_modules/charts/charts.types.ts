
import { input, type, field, GraphQLTypesMap, ErrorDetails } from '../../framework';
import { ChartDateRangeInput, ChartDateRange } from '../shared';
import { Dashboard } from '../dashboards/dashboards.types';


@input()
export class GetChartInput  {
    @field({ type: ChartDateRangeInput, required: true, isArray: true })
    dateRange: ChartDateRangeInput[];

    @field({ type: GraphQLTypesMap.String })
    frequency: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings: string[];

    @field({ type: GraphQLTypesMap.String })
    xAxisSource: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    comparison: string[];

    @field({ type: GraphQLTypesMap.Boolean })
    isDrillDown: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    isFutureTarget: boolean;

}


@input()
export class ChartAttributesInput  {
    @field({ type: GraphQLTypesMap.String, required: true })
    title: string;

    @field({ type: GraphQLTypesMap.String })
    subtitle: string;

    @field({ type: GraphQLTypesMap.String })
    group: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    kpis: string[];

    @field({ type: ChartDateRangeInput, isArray: true })
    dateRange: ChartDateRangeInput[];

    @field({ type: GraphQLTypesMap.String })
    frequency: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings: string[];

    @field({ type: GraphQLTypesMap.String })
    chartDefinition: string;

    @field({ type: GraphQLTypesMap.String })
    xAxisSource: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    comparison: string[];

    @field({ type: GraphQLTypesMap.String, isArray: true })
    dashboards: string[];

}


@type()
export class ChartEntityResponse  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    title: string;

    @field({ type: GraphQLTypesMap.String })
    subtitle: string;

    @field({ type: GraphQLTypesMap.String })
    group: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    kpis: string[];

    @field({ type: ChartDateRange })
    dateRange: ChartDateRange;

    @field({ type: GraphQLTypesMap.String })
    filter: string;

    @field({ type: GraphQLTypesMap.String })
    frequency: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings: string[];

    @field({ type: GraphQLTypesMap.String })
    xFormat: string;

    @field({ type: GraphQLTypesMap.String })
    yFormat: string;

    @field({ type: GraphQLTypesMap.String })
    chartDefinition: string;

    @field({ type: GraphQLTypesMap.String })
    xAxisSource: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    comparison: string[];

    @field({ type: GraphQLTypesMap.String, isArray: true })
    availableComparison: string[];

    @field({ type: Dashboard, isArray: true })
    dashboards: Dashboard[];

}


@type()
export class ChartMutationResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: ChartEntityResponse })
    entity: ChartEntityResponse;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class ListChartsQueryResponse  {
    @field({ type: ChartEntityResponse, isArray: true })
    data: ChartEntityResponse[];

}


@type()
export class ChartsGroupResponse  {
    @field({ type: GraphQLTypesMap.String, isArray: true })
    group: string[];

}


@type()
export class ChartsGroup  {
    @field({ type: GraphQLTypesMap.String, isArray: true })
    data: string[];

}

