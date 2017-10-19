import { GetDateRangesQuery } from '../../queries/app/date-ranges/get-date-ranges.query';
import { IDateRangeItem, IDateRangeComparisonItem } from './../../queries/app/date-ranges/date-range.helper';
import { IDataSource } from './../../models/app/data-sources/IData-source';
import { GetDataSourcesQuery } from './../../queries/app/data-sources/get-data-sources.query';
import { GraphqlDefinition } from '../graphql-definition';
import { IGraphqlContext } from '../graphql-context';

export const dateRangesGql: GraphqlDefinition = {
    name: 'date-ranges',
    schema: {
        types: `
            type DateRangeComparisonItem {
                key: String
                value: String
            }
            type DateRangeResponse {
                dateRange: ChartDateRange
                comparisonItems: [DateRangeComparisonItem]
            }
        `,
        queries: `dateRanges(filter: String): [DateRangeResponse]`,
        mutations: ``
    },
    resolvers: {
        Query: {
            dateRanges(root: any, args, ctx: IGraphqlContext) {
                let query = new GetDateRangesQuery(ctx.req.identity);
                return ctx.queryBus.run('get-date-ranges', query, args);
            }
        },
        DateRangeResponse: {
            dateRange(entity: IDateRangeItem) { return entity.dateRange; },
            comparisonItems(entity: IDateRangeItem) { return entity.comparisonItems; }
        }
    }
};
