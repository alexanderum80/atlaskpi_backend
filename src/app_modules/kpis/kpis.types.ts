import { resolver } from '../../framework/decorators/index';
import { Widget } from '../widgets/widgets.types';
import { input, type, field, GraphQLTypesMap, ErrorDetails } from '../../framework';
import { PaginationInfo, ChartDateRangeInput, ChartDateRange } from '../shared';
import { ChartEntityResponse } from '../charts/charts.types';
import { KPIFilterHelper } from '../../domain/app/kpis/kpi-filter.helper';
import { KPIExpressionHelper } from '../../domain/app/kpis/kpi-expression.helper';
import { KPIGroupingsHelper } from '../../domain/app/kpis/kpi-groupings.helper';

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
export class KPIEntityResponse {
    @field({ type: ChartEntityResponse, isArray: true})
    chart: ChartEntityResponse[];

    @field({ type: Widget, isArray: true})
    widget: Widget[];
}



@type()
export class KPIRemoveResponse  {
    @field({ type: KPIEntityResponse })
    entity: KPIEntityResponse;

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

    @resolver({ forField: 'dateRange' })
    static resolveDateRange(entity: any) {
        return entity.dateRange;
    }

    @field({ type: GraphQLTypesMap.String })
    filter: string;

    @resolver({ forField: 'filter' })
    static resolveFilter(entity: any) {
        return KPIFilterHelper.PrepareFilterField(entity.type, entity.filter);
    }

    @field({ type: GraphQLTypesMap.String })
    frequency: string;

    @field({ type: GraphQLTypesMap.String })
    axisSelection: string;

    @field({ type: GraphQLTypesMap.String })
    emptyValueReplacement: string;

    @field({ type: GraphQLTypesMap.String })
    expression: string;

    @resolver({ forField: 'expression' })
    static resolveExpression(entity: any)  {
        return KPIExpressionHelper.PrepareExpressionField(entity.type, entity.expression);
    }

    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    availableGroupings: string[];

    @resolver({ forField: 'availableGroupings'})
    static resolveavailableGroupings(entity: any) {
        KPIGroupingsHelper.GetAvailableGroupings(entity);
    }

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

