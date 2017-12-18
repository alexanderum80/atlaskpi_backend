import { KPIGroupingsHelper } from './../../domain/app/kpis/kpi-groupings.helper';
import { KPIFilterHelper } from './../../domain/app/kpis/kpi-filter.helper';
import { KPIExpressionHelper } from './../../domain/app/kpis/kpi-expression.helper';
import { type } from '../../framework/decorators/type.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { ChartEntityResponse } from '../charts/charts.types';
import { ChartDateRange, ChartDateRangeInput, PaginationInfo } from '../shared/shared.types';
import { resolver } from '../../framework/decorators/resolver.decorator';
import { IKPI } from '../../domain/app/kpis/kpi';

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

    @resolver({ forField: 'dateRange' })
    static resolveDateRange = (entity: IKPI) => entity.dateRange[0]

    @resolver({ forField: 'expression' })
    static resolveExpression = (entity: IKPI) =>  KPIExpressionHelper.PrepareExpressionField(entity.type, entity.expression)

    @resolver({ forField: 'filter' })
    static resolveFilter = (entity: IKPI) => JSON.stringify(KPIFilterHelper.PrepareFilterField(entity.type, entity.filter))

    @resolver({ forField: 'availableGroupings' })
    static resolveAvailableGroupings = (entity: IKPI) => KPIGroupingsHelper.GetAvailableGroupings(entity)
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

