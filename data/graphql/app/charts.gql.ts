import { PreviewChartsQuery } from '../../queries/app/charts/preview-chart.query';
import { DrillDownQuery } from '../../queries/app/charts/drilldown-query';
import { IChartDateRange, IDateRange } from '../../models/common/date-range';
import { IChartDocument } from '../../models/app/charts';
import { CreateChartMutation, DeleteChartMutation, UpdateChartMutation } from '../../mutations/app/charts';
import { IChart } from '../../models/app/charts';
import { IMutationResponse } from '../../models';
import { GetChartQuery } from '../../queries/app/charts/get-chart.query';
import { GetChartsQuery } from '../../queries/app/charts/get-charts.query';
import { ListChartsQuery } from '../../queries/app/charts/list-charts.query';
import { GetChartDefinitionQuery } from '../../queries';
import { GraphqlDefinition } from '../graphql-definition';
import { ExtendedRequest } from '../../../middlewares';
import { IGraphqlContext } from '../graphql-context';
import * as logger from 'winston';

export const chartsGql: GraphqlDefinition = {
    name: 'reporting',
    schema: {
        types: `
            input GetChartInput {
                dateRange: ChartDateRangeInput!
                frequency: String
                groupings: [String]!
                xAxisSource: String
            }
            input ChartAttributesInput {
                title: String!
                subtitle: String
                kpis: [String]
                dateRange: ChartDateRangeInput
                frequency: String
                groupings: [String]
                chartDefinition: String
                xAxisSource: String
                dashboards: [String]
            }
            input DrillDateInput {
                from: String
                to: String
            }
            input DrillDateRange {
                custom: [DrillDateInput]
                predefined: String
            }
            input DrillDownData {
                dateRange: DrillDateRange
                frequency: String
                groupings: [String]!
                xAxisSource: String
            }
            type ChartEntityResponse {
                _id: String
                title: String
                subtitle: String
                group: String
                kpis: [String]
                dateRange: ChartDateRange
                filter: String
                frequency: String
                groupings: String
                xFormat: String
                yFormat: String
                chartDefinition: String
                xAxisSource: String
                dashboards: [Dashboard]
            }
            type ChartMutationResponse {
                success: Boolean
                entity: ChartEntityResponse
                errors: [ErrorDetails]
            }
            type ListChartsQueryResponse {
                data: [ChartEntityResponse]
            }
            type DrillDownResult {
                success: Boolean
                entity: [ChartEntityResponse]
                errors: [ErrorDetails]
            }
        `,
        queries: `
            charts(from: String!, to: String!, preview: Boolean): String

            chartsList(preview: Boolean): String

            chart(id: String, input: GetChartInput): String

            previewChart(input: ChartAttributesInput): String

            listCharts: ListChartsQueryResponse

            drillDown(id: String, data: DrillDownData): String
        `,
        mutations: `
            createChart(input: ChartAttributesInput): ChartMutationResponse
            deleteChart(id: String!): ChartMutationResponse
            updateChart(id: String!, input: ChartAttributesInput!): ChartMutationResponse
        `,
    },

    resolvers: {
        Query: {
            charts(root: any, args, ctx: IGraphqlContext) {
                let query = new GetChartQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-chart-data', query, args, ctx.req);
            },

            chartsList(root: any, args, ctx: IGraphqlContext) {
                let query = new GetChartsQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-charts', query, args, ctx.req);
            },

            chart(root: any, args, ctx: IGraphqlContext) {
                let query = new GetChartQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-chart', query, args, ctx.req);
            },

            previewChart(root: any, args, ctx: IGraphqlContext) {
                let query = new PreviewChartsQuery(ctx.req.identity, ctx);
                return ctx.queryBus.run('preview-chart', query, args, ctx.req);
            },

            listCharts(root: any, args, ctx: IGraphqlContext) {
                let query = new ListChartsQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('list-charts', query, args, ctx.req);
            },

            drillDown(root: any, args, ctx: IGraphqlContext) {
                let query = new DrillDownQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('drill-down', query, args, ctx.req);
            }
        },
        Mutation: {
            createChart(root: any, args, ctx: IGraphqlContext) {
                let mutation = new CreateChartMutation(ctx.req.identity, ctx.req.appContext.Chart,
                                                       ctx.req.appContext.KPI, ctx.req.appContext.Dashboard);
                return ctx.mutationBus.run<IMutationResponse>('create-chart', ctx.req, mutation, args);
            },
            deleteChart(root: any, args, ctx: IGraphqlContext) {
                let mutation = new DeleteChartMutation(ctx.req.identity, ctx.req.appContext.Chart, ctx.req.appContext.Dashboard);
                return ctx.mutationBus.run<IMutationResponse>('delete-chart', ctx.req, mutation, args);
            },
            updateChart(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateChartMutation(ctx.req.identity, ctx.req.appContext.Chart,
                                                       ctx.req.appContext.KPI, ctx.req.appContext.Dashboard);
                return ctx.mutationBus.run<IMutationResponse>('delete-chart', ctx.req, mutation, args);
            },
        },
        ChartMutationResponse: {
            entity(response: IMutationResponse) { return response.entity; },
            errors(response: IMutationResponse) { return response.errors; }
        },
        ChartDateRange: {
            predefined(dateRange: IChartDateRange) { return dateRange.predefined; },
            custom(dateRange: IChartDateRange) { return dateRange.custom; }
        },
        ChartEntityResponse: {
            dateRange(entity: IChart) { return entity.dateRange; },
            chartDefinition(entity: IChart) { return JSON.stringify(entity.chartDefinition); },
            dashboards(entity: IChart) { return entity.dashboards; }
        },
        ListChartsQueryResponse: {
            data(response: [IChartDocument]) { return response; }
        }
    }
};

