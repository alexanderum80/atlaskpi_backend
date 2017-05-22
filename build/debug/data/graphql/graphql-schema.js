"use strict";
var import_from_spreadsheet_1 = require("./master/import-from-spreadsheet");
var _ = require("lodash");
var logger = require("winston");
// import definitions
var master_1 = require("./master");
var app_1 = require("./app");
// let files = getGlobbedFiles(path.join(__dirname, '**', '*.gql.ts'));
var definitions = [];
definitions.push(app_1.commonGql);
definitions.push(master_1.accountsGql);
definitions.push(app_1.usersGql);
definitions.push(app_1.kpisGql);
definitions.push(app_1.businessUnitsGql);
definitions.push(app_1.chartFormatGql);
definitions.push(app_1.chartsGql);
definitions.push(app_1.dashboardGql);
definitions.push(import_from_spreadsheet_1.spreadsheetGpl);
var moduleQueries = [];
var moduleTypes = [];
var moduleMutations = [];
var moduleResolvers = [];
definitions.forEach(function (definition) {
    logger.debug("loading gql definition for: " + definition.name);
    moduleQueries.push(definition.schema.queries);
    moduleTypes.push(definition.schema.types);
    moduleMutations.push(definition.schema.mutations);
    moduleResolvers.push(definition.resolvers);
});
var schema = "\ntype Query {\n    " + moduleQueries.join('\n') + "\n}\n\n" + moduleTypes.join('\n') + "\n\ntype Mutation {\n    " + moduleMutations.join('\n') + "\n}\nschema {\n  query: Query\n  mutation: Mutation\n}\n";
// logger.debug('Full gql definition: ' + schema);
// --- MERGE RESOLVERS
function mergeModuleResolvers(baseResolvers) {
    moduleResolvers.forEach(function (module) {
        baseResolvers = _.merge(baseResolvers, module);
    });
    return baseResolvers;
}
exports.GraphqlSchema = {
    schema: [schema],
    resolvers: mergeModuleResolvers({})
};
//# sourceMappingURL=graphql-schema.js.map