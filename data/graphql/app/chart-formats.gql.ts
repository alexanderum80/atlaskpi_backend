import { GraphqlDefinition } from '../graphql-definition';
import { IGraphqlContext } from '../graphql-context';
import { IMutationResponse, IPagedQueryResult, IQueryResponse } from '../../models/common';
import {
    CreateChartFormatMutation,
    UpdateChartFormatMutation,
    RemoveChartFormatMutation
} from '../../mutations/app/chart-formats';
import { GetAllChartFormatsQuery, GetChartFormatByIdQuery } from '../../queries/app';
import { IChartFormat, IChartFormatDocument } from '../../models/app/chart-formats';

export const chartFormatGql: GraphqlDefinition = {
    name: 'chart-format',
    schema: {
        types: `
            input ChartFormatDetails{
                name: String!
                type: String
                typeFormat: TypeFormatIn
            },
            input TypeFormatIn{
                before: String
                after: String
                decimal: String
                formula: String
            },
            type ChartFormatMutationResult {
                chartFormat: ChartFormat
                errors: [ErrorDetails]
            },
            type ChartFormatQueryResult {
                chartFormat: ChartFormat
                errors: [ErrorDetails]
            },
            type ChartFormatPagedQueryResult {
                pagination: PaginationInfo
                data: [ChartFormat]
            },  
            type ChartFormat {
                _id: String
                name: String
                type: String
                typeFormat: TypeFormat
            },
            type TypeFormat{
                before: String
                after: String
                decimal: String
                formula: String
            }
        `,
        queries: `
            getAllChartFormats(details: PaginationDetails): ChartFormatPagedQueryResult
            getChartFormatById(id:String): ChartFormatQueryResult
        `,
        mutations: `
            createChartFormat(details: ChartFormatDetails): ChartFormatMutationResult 
            updateChartFormat(id: String, data: ChartFormatDetails): ChartFormatMutationResult
            removeChartFormat(id: String): ChartFormatMutationResult
        `,
    },


    resolvers: {
        Query: {
            getAllChartFormats(root: any, args, ctx: IGraphqlContext) {
                let query = new GetAllChartFormatsQuery(ctx.req.identity, ctx.req.appContext.ChartFormat);
                return ctx.queryBus.run('get-all-chart-formats', query, args, ctx.req);
            },
            getChartFormatById(root: any, args, ctx: IGraphqlContext) {
                let query = new GetChartFormatByIdQuery(ctx.req.identity, ctx.req.appContext.ChartFormat);
                return ctx.queryBus.run('get-chart-format-by-id', query, args, ctx.req);
            }
        },
        Mutation: {
            createChartFormat(root: any, args, ctx: IGraphqlContext) {
                let mutation = new CreateChartFormatMutation(ctx.req.identity, ctx.req.appContext.ChartFormat);
                return ctx.mutationBus.run<IMutationResponse>('create-chart-format', ctx.req, mutation, args);
            },
            updateChartFormat(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateChartFormatMutation(ctx.req.identity, ctx.req.appContext.ChartFormat);
                return ctx.mutationBus.run<IMutationResponse>('update-chart-format', ctx.req, mutation, args);
            },
            removeChartFormat(root: any, args, ctx: IGraphqlContext) {
                let mutation = new RemoveChartFormatMutation(ctx.req.identity, ctx.req.appContext.ChartFormat);
                return ctx.mutationBus.run<IMutationResponse>('remove-chart-format', ctx.req, mutation, args);
            },
        },
        ChartFormatPagedQueryResult: {
            pagination(response: IPagedQueryResult<IChartFormat>) { return response.pagination; },
            data(response: IPagedQueryResult<IChartFormat>) { return response.data; }
        },
         ChartFormatQueryResult: {
           chartFormat(response: IQueryResponse<IChartFormatDocument>) {
                return response.data;
            },
            errors(response: IQueryResponse<IChartFormatDocument>) { return response.errors; }
        },
        ChartFormatMutationResult: {
           chartFormat(response: IMutationResponse) {
                return response.entity;
            },
            errors(response: IMutationResponse) { return response.errors; }
        },
        ChartFormat: {
            typeFormat(response) {
                 return response.typeFormat;
            },
        }
    }
};