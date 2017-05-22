"use strict";
var __1 = require("../..");
exports.industriesGql = {
    name: 'industries',
    schema: {
        types: "\n            type SubIndustry {\n                _id: String\n                name: String\n            }\n            type Industry {\n                _id: String\n                name: String\n                subIndustries: [SubIndustry]\n            }\n        ",
        queries: "\n            industries: [Industry]\n        ",
        mutations: "\n        "
    },
    resolvers: {
        Query: {
            industries: function (root, args, ctx) {
                var query = new __1.GetIndustriesQuery(ctx.req.identity, ctx.req.masterContext.Industry);
                return ctx.queryBus.run('get-industries', query, args)
                    .then(function (industries) { return industries; }, function (err) { return err; });
            }
        },
        Mutation: {},
        Industry: {
            subIndustries: function (industry) {
                return {
                    subIndustries: industry.subIndustries || ''
                };
            }
        }
    }
};
//# sourceMappingURL=industries.gql.js.map