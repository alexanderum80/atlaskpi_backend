"use strict";
var chart_formats_1 = require("../../mutations/app/chart-formats");
var app_1 = require("../../queries/app");
exports.chartFormatGql = {
    name: 'chart-format',
    schema: {
        types: "\n            input ChartFormatDetails{\n                name: String!\n                type: String\n                typeFormat: TypeFormatIn\n            },\n            input TypeFormatIn{\n                before: String\n                after: String\n                decimal: String\n                formula: String\n            },\n            type ChartFormatMutationResult {\n                chartFormat: ChartFormat\n                errors: [ErrorDetails]\n            },\n            type ChartFormatQueryResult {\n                chartFormat: ChartFormat\n                errors: [ErrorDetails]\n            },\n            type ChartFormatPagedQueryResult {\n                pagination: PaginationInfo\n                data: [ChartFormat]\n            },  \n            type ChartFormat {\n                _id: String\n                name: String\n                type: String\n                typeFormat: TypeFormat\n            },\n            type TypeFormat{\n                before: String\n                after: String\n                decimal: String\n                formula: String\n            }\n        ",
        queries: "\n            getAllChartFormats(details: PaginationDetails): ChartFormatPagedQueryResult\n            getChartFormatById(id:String): ChartFormatQueryResult\n        ",
        mutations: "\n            createChartFormat(details: ChartFormatDetails): ChartFormatMutationResult \n            updateChartFormat(id: String, data: ChartFormatDetails): ChartFormatMutationResult\n            removeChartFormat(id: String): ChartFormatMutationResult\n        "
    },
    resolvers: {
        Query: {
            getAllChartFormats: function (root, args, ctx) {
                var query = new app_1.GetAllChartFormatsQuery(ctx.req.identity, ctx.req.appContext.ChartFormat);
                return ctx.queryBus.run('get-all-chart-formats', query, args);
            },
            getChartFormatById: function (root, args, ctx) {
                var query = new app_1.GetChartFormatByIdQuery(ctx.req.identity, ctx.req.appContext.ChartFormat);
                return ctx.queryBus.run('get-chart-format-by-id', query, args);
            }
        },
        Mutation: {
            createChartFormat: function (root, args, ctx) {
                var mutation = new chart_formats_1.CreateChartFormatMutation(ctx.req.identity, ctx.req.appContext.ChartFormat);
                return ctx.mutationBus.run('create-chart-format', ctx.req, mutation, args);
            },
            updateChartFormat: function (root, args, ctx) {
                var mutation = new chart_formats_1.UpdateChartFormatMutation(ctx.req.identity, ctx.req.appContext.ChartFormat);
                return ctx.mutationBus.run('update-chart-format', ctx.req, mutation, args);
            },
            removeChartFormat: function (root, args, ctx) {
                var mutation = new chart_formats_1.RemoveChartFormatMutation(ctx.req.identity, ctx.req.appContext.ChartFormat);
                return ctx.mutationBus.run('remove-chart-format', ctx.req, mutation, args);
            }
        },
        ChartFormatPagedQueryResult: {
            pagination: function (response) { return response.pagination; },
            data: function (response) { return response.data; }
        },
        ChartFormatQueryResult: {
            chartFormat: function (response) {
                return response.data;
            },
            errors: function (response) { return response.errors; }
        },
        ChartFormatMutationResult: {
            chartFormat: function (response) {
                return response.entity;
            },
            errors: function (response) { return response.errors; }
        },
        ChartFormat: {
            typeFormat: function (response) {
                return response.typeFormat;
            }
        }
    }
};
//# sourceMappingURL=chart-formats.gql.js.map