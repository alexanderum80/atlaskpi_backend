"use strict";
var get_charts_query_1 = require("../../queries/app/charts/get-charts.query");
var queries_1 = require("../../queries");
exports.chartsGql = {
    name: 'reporting',
    schema: {
        types: "",
        queries: "\n            charts(from: String!, to: String!, preview: Boolean): String\n            getChartDefinition(id: String!, from: String!, to: String!): String\n        ",
        mutations: ""
    },
    resolvers: {
        Query: {
            charts: function (root, args, ctx) {
                var query = new get_charts_query_1.GetChartsQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-chart-data', query, args);
            },
            getChartDefinition: function (root, args, ctx) {
                var query = new queries_1.GetChartDefinitionQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-chart-data', query, args)
                    .then(function (definition) { return JSON.stringify(definition); });
            }
        },
        Mutation: {}
    }
};
//# sourceMappingURL=charts.gql.js.map