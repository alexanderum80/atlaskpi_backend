import { resolver } from '../../framework/decorators/resolver.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { input } from '../../framework/decorators/input.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';

@input()
export class PaginationDetails  {
    @field({ type: GraphQLTypesMap.Int, required: true })
    page: number;

    @field({ type: GraphQLTypesMap.Int, required: true })
    itemsPerPage: number;

    @field({ type: GraphQLTypesMap.String })
    sortBy: string;

    @field({ type: GraphQLTypesMap.String })
    filter: string;

}


@input()
export class DateRangeInput  {
    @field({ type: GraphQLTypesMap.String })
    from: string;

    @field({ type: GraphQLTypesMap.String })
    to: string;

}


@input()
export class ChartDateRangeInput  {
    @field({ type: GraphQLTypesMap.String })
    predefined: string;

    @field({ type: DateRangeInput })
    custom: DateRangeInput;

}


@type()
export class PaginationInfo  {
    @field({ type: GraphQLTypesMap.Int })
    itemsPerPage: number;

    @field({ type: GraphQLTypesMap.Int })
    currentPage: number;

    @field({ type: GraphQLTypesMap.Int })
    totalItems: number;

}

@type()
export class ValueName  {
    @field({ type: GraphQLTypesMap.String })
    value: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;
}

@type()
export class DateRange  {
    @resolver({ forField: 'from' })
    static fromResolver(d) {
        if (!d.from) return null;
        return (d.from as Date).toISOString();
    }
    @field({ type: GraphQLTypesMap.String })
    from: string;

    @resolver({ forField: 'to' })
    static toResolver(d) {
        if (!d.from) return null;
        return (d.to as Date).toISOString();
    }
    @field({ type: GraphQLTypesMap.String })
    to: string;
}


@type()
export class ChartDateRange  {
    @field({ type: GraphQLTypesMap.String })
    predefined: string;

    @field({ type: DateRange })
    custom: DateRange;
}

@type()
export class Entity {
    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;
}
@input()
export class IDataUserDate {
    @field({type: GraphQLTypesMap.String })
    createdBy: string;
}

