import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { Dashboard } from '../dashboards/dashboards.types';
import { ChartDateRange, ChartDateRangeInput } from '../shared/shared.types';
import { IChart } from './../../domain/app/charts/chart';

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
export class ChartTopInput {
    @field({ type: GraphQLTypesMap.String })
    predefinedTop: string;

    @field({ type: GraphQLTypesMap.Int })
    customTop: number;
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

    @field({ type: ChartTopInput})
    top: ChartTopInput;

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

    @field({ type: GraphQLTypesMap.Boolean })
    isFutureTarget?: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    isDrillDown?: boolean;
}

@type()
export class ChartTopResponse {
    @field({ type: GraphQLTypesMap.String })
    predefinedTop: string;

    @field({ type: GraphQLTypesMap.Int })
    customTop: number;
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

    @field({ type: ChartTopResponse })
    top: ChartTopResponse;

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

    @resolver({ forField: 'dateRange' })
    static resolveDateRange = (entity: IChart) => entity.dateRange[0]

    @resolver({ forField: 'chartDefinition' })
    static resolveDefinition = (entity: IChart) => JSON.stringify(entity.chartDefinition)

    @resolver({ forField: 'dashboards' })
    static resolveDashboards = (entity: IChart) => entity.dashboards
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

    @resolver({ forField: 'data' })
    static resolveData = data => data
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

