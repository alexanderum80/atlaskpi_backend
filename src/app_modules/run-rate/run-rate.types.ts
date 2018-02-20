import { type } from '../../framework/decorators/type.decorator';
import { input } from '../../framework/decorators/input.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { ErrorDetails } from '../../framework/graphql/common.types';

@input()
export class ChartRunRateInput  {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String })
    chart: string;

    @field({ type: GraphQLTypesMap.String })
    startingFrom: string;

    @field({ type: GraphQLTypesMap.String })
    periodPredict: string;

    @field({ type: GraphQLTypesMap.String })
    title: string;

    @field({ type: GraphQLTypesMap.String })
    frequency: string;

}


@type()
export class ChartRunRate  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String })
    chart: string;

    @field({ type: GraphQLTypesMap.String })
    startingFrom: string;

    @field({ type: GraphQLTypesMap.String })
    periodPredict: string;

    @field({ type: GraphQLTypesMap.String })
    title: string;

    @field({ type: GraphQLTypesMap.String })
    frequency: string;

}



@type()
export class UpdateChartRunRateResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: ChartRunRate })
    entity: ChartRunRate;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class CreateChartRunRateResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: ChartRunRate })
    entity: ChartRunRate;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class DeleteChartRunRateResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: ChartRunRate })
    entity: ChartRunRate;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

