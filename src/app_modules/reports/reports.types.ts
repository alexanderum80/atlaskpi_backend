import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';

@type()
export class EndOfDayReportWinner  {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.Float })
    sales: number;

}


@type()
export class EndOfDayReportWinnerMap  {
    @field({ type: EndOfDayReportWinner, isArray: true })
    employees: EndOfDayReportWinner[];

    @field({ type: EndOfDayReportWinner, isArray: true })
    products: EndOfDayReportWinner[];

}


@type()
export class EndOfDayReport  {
    @field({ type: GraphQLTypesMap.Float })
    todaySales: number;

    @field({ type: GraphQLTypesMap.Float })
    monthSales: number;

    @field({ type: GraphQLTypesMap.Float })
    todayExpenses: number;

    @field({ type: EndOfDayReportWinnerMap })
    winners: EndOfDayReportWinnerMap;

}

