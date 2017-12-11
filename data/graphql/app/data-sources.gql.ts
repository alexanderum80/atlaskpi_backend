import { IDataSource } from './../../models/app/data-sources/IData-source';
import { GetDataSourcesQuery } from './../../queries/app/data-sources/get-data-sources.query';
import { GraphqlDefinition } from '../graphql-definition';
import { IGraphqlContext } from '../graphql-context';

export const dataSourcesGql: GraphqlDefinition = {
    name: 'data-sources',
    schema: {
        types: `
            type DataSourceField {
                path: String
                type: String
            }
            type DataSourceResponse {
                name: String
                fields: [DataSourceField]
                groupings: [String]
            }
        `,
        queries: `dataSources(filter: String): [DataSourceResponse]`,
        mutations: ``
    },
    resolvers: {
        Query: {
            dataSources(root: any, args, ctx: IGraphqlContext) {
                let query = new GetDataSourcesQuery(ctx.req.identity, ctx.req.appContext.Sale,
                                                    ctx.req.appContext.Expense);
                return ctx.queryBus.run('get-data-sources', query, args);
            }
        },
        DataSourceResponse: {
            fields(entity: IDataSource) { return entity.fields; }
        }
    }
};
