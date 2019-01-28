import { field } from '../../framework/decorators/field.decorator';
import { input } from '../../framework/decorators/input.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';

import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { ChartDateRangeInput, ChartDateRange } from '../shared/shared.types';
import { ErrorDetails } from '../../framework/graphql/common.types';

@input()
export class FunnelStageInput  {
    @field({ type: GraphQLTypesMap.String, required: true })
    _id: string;

    @field({ type: GraphQLTypesMap.Int, required: true })
    order: number;

    @field({ type: GraphQLTypesMap.String, required: true })
    name: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    kpi: string;

    @field({ type: ChartDateRangeInput, required: true })
    dateRange: ChartDateRangeInput;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    fieldsToProject: string;

    @field({ type: GraphQLTypesMap.String  })
    compareToStage: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    foreground: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    background: string;
}

@input()
export class FunnelInput  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    name: string;

    @field({ type: FunnelStageInput, isArray: true })
    stages: FunnelStageInput[];

    @field({ type: GraphQLTypesMap.String })
    createdBy: string;

    @field({ type: GraphQLTypesMap.Date })
    createdDate: Date;

    @field({ type: GraphQLTypesMap.String })
    updatedBy: string;

    @field({ type: GraphQLTypesMap.Date })
    updatedDate: Date;
}


@type()
export class RenderedFunnelStageType  {
    @field({ type: GraphQLTypesMap.String })
    _id?: string;
    @resolver({ forField: '_id' })
    static convertId(d) {
        if (!d._id) return null;
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.Int })
    order: number;

    @field({ type: GraphQLTypesMap.Float})
    count: number;

    @field({ type: GraphQLTypesMap.Float})
    amount: number;

    @field({ type: GraphQLTypesMap.Float })
    compareToStageValue?: number;

    @field({ type: GraphQLTypesMap.String })
    compareToStageName?: string;

    @field({ type: GraphQLTypesMap.String })
    foreground: string;

    @field({ type: GraphQLTypesMap.String })
    background: string;
}


@type()
export class RenderedFunnelType  {
    @field({ type: GraphQLTypesMap.String })
    _id?: string;
    @resolver({ forField: '_id' })
    static convertId(d) {
        if (!d._id) return null;
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: RenderedFunnelStageType, isArray: true})
    stages: RenderedFunnelStageType[];
}


@type()
export class FunnelStageType  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.Int })
    order: number;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    kpi: string;

    @field({ type: ChartDateRange })
    dateRange: ChartDateRange;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    fieldsToProject: string;

    @field({ type: GraphQLTypesMap.String  })
    compareToStage: string;

    @field({ type: GraphQLTypesMap.String })
    foreground: string;

    @field({ type: GraphQLTypesMap.String, })
    background: string;
}

@type()
export class FunnelType  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;
    @resolver({ forField: '_id' })
    static convertId(e) {
        return e._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: FunnelStageType, isArray: true })
    stages: FunnelStageType[];

    @field({ type: GraphQLTypesMap.String })
    createdBy: string;

    @field({ type: GraphQLTypesMap.Date })
    createdDate: Date;

    @field({ type: GraphQLTypesMap.String })
    updatedBy: string;

    @field({ type: GraphQLTypesMap.Date })
    updatedDate: Date;
}


@type()
export class FunnelEntityResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: FunnelType })
    entity: FunnelType;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}