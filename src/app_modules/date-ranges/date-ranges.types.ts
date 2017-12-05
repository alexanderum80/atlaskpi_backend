import { field, GraphQLTypesMap, type } from '../../framework';

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

