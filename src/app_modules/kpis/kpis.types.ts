import { IKPIDocument } from '../../domain/app/kpis/kpi';
import { KPIFilterHelper } from '../../domain/app/kpis/kpi-filter.helper';

import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { ChartEntityResponse } from '../charts/charts.types';
import { ChartDateRange, ChartDateRangeInput, PaginationInfo, ValueName } from '../shared/shared.types';
import { Widget } from '../widgets/widgets.types';
import { KPIExpressionHelper } from './../../domain/app/kpis/kpi-expression.helper';
import { IValueName } from '../../domain/common/value-name';

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
    groupings: IValueName[];

    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.String })
    expression: string;

    @field({ type: GraphQLTypesMap.String })
    filter: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    tags: string[];

    @field({ type: GraphQLTypesMap.String })
    source: string;

}

@input()
export class KPIFilterCriteria {
    @field({ type: GraphQLTypesMap.String, required: true })
    name: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    source: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    field: string;

    @field({ type: GraphQLTypesMap.Float })
    limit: number;

    @field({ type: GraphQLTypesMap.String })
    filter: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    collectionSource: string[];
}

@input()
export class KPIExpressionFieldInput {
    @field({ type: GraphQLTypesMap.String })
    dataSource: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    collectionSource: string[];
}

@type()
export class KPI  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

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

    @field({ type: ValueName, isArray: true })
    groupingInfo: IValueName[];

    @field({ type: ChartDateRange })
    dateRange: ChartDateRange;

    @resolver({ forField: 'dateRange' })
    static resolveDateRange(entity: IKPIDocument) {
        return entity.dateRange;
    }

    @field({ type: GraphQLTypesMap.String })
    filter: string;

    @resolver({ forField: 'filter' })
    static resolveFilter(entity: IKPIDocument) {
        return entity.filter && JSON.stringify(KPIFilterHelper.PrepareFilterField(entity.type, entity.filter));
    }

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
    tags: string[];

    @field({ type: GraphQLTypesMap.String })
    source: string;
}

@input()
export class KpiGroupingsInput {
    @field({ type: GraphQLTypesMap.String, required: true })
    id: string;

    @field({ type: ChartDateRangeInput, required: true, isArray: true })
    dateRange: ChartDateRangeInput[];
}


@type()
export class KPIEntityResponse {
    @field({ type: ChartEntityResponse, isArray: true})
    chart: ChartEntityResponse[];

    @field({ type: Widget, isArray: true})
    widget: Widget[];

    @field({ type: KPI, isArray: true })
    complexKPI: KPI[];
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


@type()
export class KPICriteriaResult {
    @field({ type: GraphQLTypesMap.String, isArray: true })
    criteriaValue: string[];

    @field({ type: ErrorDetails, isArray: true })
    errors?: ErrorDetails[];
}
