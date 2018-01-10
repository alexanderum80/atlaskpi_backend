import { type } from '../../framework/decorators/type.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { ChartDateRange } from '../shared/shared.types';

@type()
export class DateRangeComparisonItem  {
    @field({ type: GraphQLTypesMap.String })
    key: string;

    @field({ type: GraphQLTypesMap.String })
    value: string;

}

@type()
export class DateRangeResponse  {
    @field({ type: ChartDateRange })
    dateRange: ChartDateRange;

    @field({ type: DateRangeComparisonItem, isArray: true })
    comparisonItems: DateRangeComparisonItem[];

}

