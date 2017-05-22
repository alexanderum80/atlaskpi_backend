"use strict";
exports.commonGql = {
    name: 'common',
    schema: {
        types: "\n         type PaginationInfo {\n            itemsPerPage: Int\n            currentPage: Int\n            totalItems: Int\n        }\n        input PaginationDetails {\n            page: Int!\n            itemsPerPage: Int!\n            sortBy: String\n            filter: String\n        }\n        type ErrorDetails {\n            field: String\n            errors: [String]!\n        }\n        input DateRange {\n            from: String\n            to: String\n        }\n       ",
        queries: "",
        mutations: ""
    },
    resolvers: {
        Query: {},
        Mutation: {}
    }
};
//# sourceMappingURL=common.gql.js.map