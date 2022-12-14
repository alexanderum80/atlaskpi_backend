import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { Dashboard } from '../dashboards/dashboards.types';
import { ChartDateRange, ChartDateRangeInput, IDataUserDate } from '../shared/shared.types';
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
    onTheFly: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    isFutureTarget: boolean;

    @field({ type: GraphQLTypesMap.String})
    originalFrequency?: string;

    @field({ type: GraphQLTypesMap.String})
    kpiFilter?: string;
}

@input()
export class ChartTopInput {
    @field({ type: GraphQLTypesMap.String })
    predefined: string;

    @field({ type: GraphQLTypesMap.Int })
    custom: number;
}

@input()
export class ChartKpiInput {
    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.String })
    kpi: string;
}

@input()
export class ChartAttributesInput  {
    @field({ type: GraphQLTypesMap.String, required: true })
    title: string;

    @field({ type: GraphQLTypesMap.String })
    subtitle: string;

    @field({ type: GraphQLTypesMap.String })
    group: string;

    @field({ type: ChartKpiInput, isArray: true })
    kpis: ChartKpiInput[];

    @field({ type: ChartDateRangeInput, isArray: true })
    dateRange: ChartDateRangeInput[];

    @field({ type: ChartTopInput})
    top: ChartTopInput;

    @field({ type: GraphQLTypesMap.String })
    frequency: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings: string[];

    @field({ type: GraphQLTypesMap.String })
    sortingCriteria: string;

    @field({ type: GraphQLTypesMap.String })
    sortingOrder: string;

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
export class ChartTopResponse {
    @field({ type: GraphQLTypesMap.String })
    predefined: string;

    @field({ type: GraphQLTypesMap.Int })
    custom: number;
}

@type()
export class ChartKpiType {
    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.String })
    kpi: string;
}


@type()
export class ChartEntityResponse  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    title: string;

    @field({ type: GraphQLTypesMap.String })
    subtitle: string;

    @field({ type: GraphQLTypesMap.String })
    group: string;

    @field({ type: ChartKpiType, isArray: true })
    kpis: ChartKpiType;

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
    sortingCriteria: string;

    @field({ type: GraphQLTypesMap.String })
    sortingOrder: string;

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

     //add-created
     @field({ type: GraphQLTypesMap.String })
     createdBy: string;
 
     @field({ type: GraphQLTypesMap.Date })
     createdDate: Date;
 
     @field({ type: GraphQLTypesMap.String })
     updatedBy: string;
 
     @field({ type: GraphQLTypesMap.Date })
     updatedDate: Date;

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

