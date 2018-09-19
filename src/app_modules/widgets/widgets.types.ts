import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { ChartDateRange, ChartDateRangeInput } from '../shared/shared.types';
import { resolver } from '../../framework/decorators/resolver.decorator';


@input()
export class ChartWidgetAttributesInput  {
    @field({ type: GraphQLTypesMap.String })
    chart: string;

}


@input()
export class NumericWidgetAttributesInput  {
    @field({ type: GraphQLTypesMap.String })
    kpi: string;

    @field({ type: ChartDateRangeInput })
    dateRange: ChartDateRangeInput;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    comparison: string[];

    @field({ type: GraphQLTypesMap.String })
    comparisonArrowDirection: string;

    @field({ type: GraphQLTypesMap.String })
    trending: string;

    @field({ type: GraphQLTypesMap.String })
    format: string;

}


@input()
export class WidgetInput  {
    @field({ type: GraphQLTypesMap.Int })
    order: number;

    @field({ type: GraphQLTypesMap.String, required: true })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    type: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    size: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    color: string;

    @field({ type: NumericWidgetAttributesInput })
    numericWidgetAttributes: NumericWidgetAttributesInput;

    @field({ type: ChartWidgetAttributesInput })
    chartWidgetAttributes: ChartWidgetAttributesInput;

    @field({ type: GraphQLTypesMap.Boolean })
    preview: boolean;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    dashboards: string[];
}


@type()
export class ChartWidgetAttributes  {
    @field({ type: GraphQLTypesMap.String })
    chart: string;

}


@type()
export class NumericWidgetAttributes  {
    @field({ type: GraphQLTypesMap.String })
    kpi: string;

    @field({ type: ChartDateRange })
    dateRange: ChartDateRange;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    comparison: string[];

    @field({ type: GraphQLTypesMap.String })
    comparisonArrowDirection: string;

    @field({ type: GraphQLTypesMap.String })
    trending: string;

    @field({ type: GraphQLTypesMap.String })
    format: string;

}


@type()
export class WidgetMaterializedComparison  {
    @field({ type: GraphQLTypesMap.String })
    period: string;

    @field({ type: GraphQLTypesMap.String })
    value: string;

    @field({ type: GraphQLTypesMap.String })
    arrowDirection: string;

}


@type()
export class WidgetMaterializedFields  {
    @field({ type: GraphQLTypesMap.String })
    value: string;

    @field({ type: GraphQLTypesMap.String })
    comparisonValue: string;

    @field({ type: WidgetMaterializedComparison })
    comparison: WidgetMaterializedComparison;

    @field({ type: GraphQLTypesMap.String })
    trending: string;

    @field({ type: GraphQLTypesMap.String })
    chart: string;

}

@type()
export class Widget  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.Int })
    order: number;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.String })
    size: string;

    @field({ type: GraphQLTypesMap.String })
    color: string;

    @field({ type: NumericWidgetAttributes })
    numericWidgetAttributes: NumericWidgetAttributes;

    @field({ type: ChartWidgetAttributes })
    chartWidgetAttributes: ChartWidgetAttributes;

    @field({ type: WidgetMaterializedFields })
    materialized: WidgetMaterializedFields;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    tags: string[];

    @field({ type: GraphQLTypesMap.String, isArray: true})
    dashboards: string[];
}



@type()
export class WidgetMutationResponse  {
    @field({ type: Widget })
    entity: Widget;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

}

