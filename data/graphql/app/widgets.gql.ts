import { PreviewWidgetQuery } from './../../queries/app/widgets/preview-widget.query';
import { WidgetsService } from './../../services/widgets/widgets.service';
import { RemoveWidgetMutation } from '../../mutations/app/widgets/remove-widget.mutation';
import { UpdateWidgetMutation } from './../../mutations/app/widgets/update-widget.mutation';
import { IWidget } from '../../models/app/widgets';
import { INumericWidgetAttributes } from './../../models/app/widgets/IWidget';
import { IMutationResponse } from './../../models/common/mutation-response';
import { CreateWidgetMutation } from '../../mutations/app/widgets/create-widget.mutation';
import { IGraphqlContext } from './../graphql-context';
import { ListWidgetsQuery } from './../../queries/app/widgets/list-widgets.query';
import { GraphqlDefinition } from './../graphql-definition';

export const widgetsGql: GraphqlDefinition = {
    name: 'widgets',
    schema: {
        types: `
            input ChartWidgetAttributesInput {
                chart: String!
            }

            input NumericWidgetAttributesInput {
                kpi: String!,
                dateRange: ChartDateRangeInput!,
                comparison: [String],
                bestValue: String,
                trending: String
            }

            input WidgetInput {
                order: Int,
                name: String!,
                description: String,
                type: String!,
                size: String!,
                color: String!,
                format: String,
                numericWidgetAttributes: NumericWidgetAttributesInput,
                chartWidgetAttributes: ChartWidgetAttributesInput,

                preview: Boolean
            }

            type ChartWidgetAttributes {
                chart: String
            }

            type NumericWidgetAttributes {
                kpi: String,
                dateRange: ChartDateRange,
                comparison: [String],
                bestValue: String,
                trending: String
            }

            type Widget {
                _id: String,
                order: Int,
                name: String,
                description: String,
                type: String,
                size: String,
                color: String,
                format: String,
                numericWidgetAttributes: NumericWidgetAttributes,
                chartWidgetAttributes: ChartWidgetAttributes

                value: String,
                direction: String,
                trending: String,
                chart: String
            }

            type WidgetMutationResponse {
                entity: Widget,
                errors: [ErrorDetails],
                success: Boolean
            }
        `,
        queries: `
            listWidgets: [Widget]
            previewWidget(input: WidgetInput): Widget
        `,
        mutations: `
            createWidget(input: WidgetInput!): WidgetMutationResponse
            updateWidget(id: String!, input: WidgetInput!): WidgetMutationResponse
            removeWidget(id: String!): WidgetMutationResponse
        `,
    },
    resolvers: {
        Query: {
            listWidgets(root: any, args, ctx: IGraphqlContext) {
                const widgetService = new WidgetsService(ctx.req.appContext);
                const query = new ListWidgetsQuery(ctx.req.identity, widgetService);
                return ctx.queryBus.run('list-widgets', query, args, ctx.req);
            },
            previewWidget(root: any, args, ctx: IGraphqlContext) {
                const widgetService = new WidgetsService(ctx.req.appContext);
                const query = new PreviewWidgetQuery(ctx.req.identity, widgetService);
                return ctx.queryBus.run('preview-widget', query, args, ctx.req);
            }
         },
        Mutation: {
            createWidget(root: any, args, ctx: IGraphqlContext) {
                const mutation = new CreateWidgetMutation(  ctx.req.identity,
                                                            ctx.req.appContext.Widget,
                                                            ctx.req.appContext.KPI,
                                                            ctx.req.appContext.Dashboard);
                return ctx.mutationBus.run('create-widget', ctx.req, mutation, args);
            },
            updateWidget(root: any, args, ctx: IGraphqlContext) {
                const mutation = new UpdateWidgetMutation(  ctx.req.identity,
                                                            ctx.req.appContext.Widget,
                                                            ctx.req.appContext.KPI,
                                                            ctx.req.appContext.Dashboard);
                return ctx.mutationBus.run('update-widget', ctx.req, mutation, args);
            },
            removeWidget(root: any, args, ctx: IGraphqlContext) {
                const mutation = new RemoveWidgetMutation(  ctx.req.identity,
                                                            ctx.req.appContext.Widget,
                                                            ctx.req.appContext.Dashboard);
                return ctx.mutationBus.run('remove-widget', ctx.req, mutation, args);
            }
        },
        WidgetMutationResponse: {
            entity(response: IMutationResponse) { return response.entity; },
            errors(response: IMutationResponse) { return response.errors; }
        },
        NumericWidgetAttributes: {
            dateRange(NumericWidgetAttributes: INumericWidgetAttributes) { return NumericWidgetAttributes.dateRange; }
        },
        Widget: {
            numericWidgetAttributes(entity: IWidget) { return entity.numericWidgetAttributes; },
            chartWidgetAttributes(entity: IWidget) { return entity.chartWidgetAttributes; }
        }
    }
};