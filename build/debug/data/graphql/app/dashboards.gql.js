"use strict";
var dashboards_1 = require("../../queries/app/dashboards");
exports.dashboardGql = {
    name: 'dashboards',
    schema: {
        types: "\n            type Dashboard {\n                _id: String\n                name: String\n                group: String\n                charts: [String]\n            }\n        ",
        queries: "\n            dashboard(id: String!, dateRange: DateRange!, frequency: String): Dashboard\n        ",
        mutations: ""
    },
    resolvers: {
        Query: {
            dashboard: function (root, args, ctx) {
                var query = new dashboards_1.GetDashboardQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-dashboard', query, args);
            }
        },
        Mutation: {}
    }
};
//# sourceMappingURL=dashboards.gql.js.map