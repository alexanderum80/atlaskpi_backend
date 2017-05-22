"use strict";
var kpis_1 = require("../../mutations/app/kpis");
var kpis_2 = require("../../queries/app/kpis");
exports.kpisGql = {
    name: 'kpis',
    schema: {
        types: "\n            input KPIDetails {\n                name: String!\n                description: String\n                formula: String!\n                group: String\n                emptyValueReplacement: String\n            },\n            type KPIResult {\n                kpi: KPI\n                errors: [ErrorDetails]\n            }\n            type KPI {\n                _id: String\n                name: String\n                description: String\n                formula: String\n                group: String\n                emptyValueReplacement: String\n            }  \n            type KPIPagedQueryResult {\n                pagination: PaginationInfo\n                data: [KPI]\n            }       \n            \n        ",
        queries: "\n            getAllKPIs(details: PaginationDetails): KPIPagedQueryResult\n        ",
        mutations: "\n            createKPI(data: KPIDetails): KPIResult\n            updateKPI(id: String, data: KPIDetails): KPIResult\n            removeKPI(id: String): KPIResult\n        "
    },
    resolvers: {
        Query: {
            getAllKPIs: function (root, args, ctx) {
                var query = new kpis_2.GetAllKPIsQuery(ctx.req.identity, ctx.req.appContext.KPI);
                return ctx.queryBus.run('get-all-kpis', query, args);
            }
        },
        Mutation: {
            createKPI: function (root, args, ctx) {
                var mutation = new kpis_1.CreateKPIMutation(ctx.req.identity, ctx.req.appContext.KPI);
                return ctx.mutationBus.run('create-kpi', ctx.req, mutation, args);
            },
            updateKPI: function (root, args, ctx) {
                var mutation = new kpis_1.UpdateKPIMutation(ctx.req.identity, ctx.req.appContext.KPI);
                return ctx.mutationBus.run('update-kpi', ctx.req, mutation, args);
            },
            removeKPI: function (root, args, ctx) {
                var mutation = new kpis_1.RemoveKPIMutation(ctx.req.identity, ctx.req.appContext.KPI);
                return ctx.mutationBus.run('remove-kpi', ctx.req, mutation, args);
            }
        },
        KPIPagedQueryResult: {
            pagination: function (res) { return res.pagination; },
            data: function (res) { return res.data; }
        },
        KPIResult: {
            kpi: function (response) { return response.entity; },
            errors: function (response) { return response.errors; }
        }
    }
};
//# sourceMappingURL=kpis.gql.js.map