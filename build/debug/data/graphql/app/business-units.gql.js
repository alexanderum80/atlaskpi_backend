"use strict";
var business_units_1 = require("../../queries/app/business-units");
var business_units_2 = require("../../mutations/app/business-units");
exports.businessUnitsGql = {
    name: 'businessUnits',
    schema: {
        types: "\n            input NamedTypeDetails {\n                id: Int!\n                name: String!\n            }\n            input BusinessUnitDetails {\n                name: String!,\n                industry: NamedTypeDetails,\n                subIndustry: NamedTypeDetails,\n                shortName: String,\n                active: Boolean!,\n                phone: String,\n                website: String,\n                address1: String,\n                address2: String,\n                city: String,\n                state: String,\n                zip: String,\n                timezone: String,\n                timeFormat: String,\n                dateFormat: String,\n                defaultCurrency: String,\n                defaultLanguage: String,\n                firstDayOfWeek: String,\n            }\n            type NamedType {\n                id: Int\n                name: String\n            }\n            type BusinessUnit {\n                _id: String,\n                name: String,\n                shortName: String,\n                active: Boolean,\n                phone: String,\n                website: String,\n                address1: String,\n                address2: String,\n                city: String,\n                state: String,\n                zip: String,\n                timezone: String,\n                timeFormat: String,\n                dateFormat: String,\n                defaultCurrency: String,\n                defaultLanguage: String,\n                firstDayOfWeek: String,\n                industry: NamedType\n                subIndustry: NamedType\n            }\n            type BusinessUnitActionResponse {\n                businessUnit: BusinessUnit\n                errors: [ErrorDetails]\n            }\n            type BusinessUnitsPagedQueryResponse {\n                pagination: PaginationInfo\n                data: [BusinessUnit]\n            }   \n            type BusinessUnitResult {\n                businessUnit: BusinessUnit\n                errors: [ErrorDetails]\n            }  \n            ",
        queries: "\n            businessUnits(details: PaginationDetails): BusinessUnitsPagedQueryResponse\n            businessUnit(id: String!): BusinessUnitResult\n            ",
        mutations: "\n            createBusinessUnit(details: BusinessUnitDetails): BusinessUnitActionResponse\n            updateBusinessUnit(id: String!, details: BusinessUnitDetails): BusinessUnitActionResponse\n            removeBusinessUnit(id: String!): BusinessUnitActionResponse\n        "
    },
    resolvers: {
        Query: {
            businessUnits: function (root, args, ctx) {
                var query = new business_units_1.ListAllBusinessUnitsQuery(ctx.req.identity, ctx.req.appContext.BusinessUnit);
                return ctx.queryBus.run('list-all-business-units', query, args);
            },
            businessUnit: function (root, args, ctx) {
                var query = new business_units_1.FindBusinessUnitByIdQuery(ctx.req.identity, ctx.req.appContext.BusinessUnit);
                return ctx.queryBus.run('find-business-unit-by-id', query, args);
            }
        },
        Mutation: {
            createBusinessUnit: function (root, args, ctx) {
                var mutation = new business_units_2.CreateBusinessUnitMutation(ctx.req.identity, ctx.req.appContext.BusinessUnit);
                return ctx.mutationBus.run('create-business-unit', ctx.req, mutation, args);
            },
            updateBusinessUnit: function (root, args, ctx) {
                var mutation = new business_units_2.UpdateBusinessUnitByIdMutation(ctx.req.identity, ctx.req.appContext.BusinessUnit);
                return ctx.mutationBus.run('update-business-unit-by-id', ctx.req, mutation, args);
            },
            removeBusinessUnit: function (root, args, ctx) {
                var mutation = new business_units_2.RemoveBusinessUnitByIdMutation(ctx.req.identity, ctx.req.appContext.BusinessUnit);
                return ctx.mutationBus.run('remove-business-unit-by-id', ctx.req, mutation, args);
            }
        },
        BusinessUnitActionResponse: {
            businessUnit: function (response) { return response.entity; },
            errors: function (response) { return response.errors; }
        },
        BusinessUnitsPagedQueryResponse: {
            pagination: function (response) { return response.pagination; },
            data: function (response) { return response.data; }
        },
        BusinessUnitResult: {
            businessUnit: function (response) { return response.data; },
            errors: function (response) { return response.errors; }
        },
        BusinessUnit: {
            industry: function (businessUnit) { return businessUnit.industry; },
            subIndustry: function (businessUnit) { return businessUnit.subIndustry; }
        }
    }
};
//# sourceMappingURL=business-units.gql.js.map