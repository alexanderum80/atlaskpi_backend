"use strict";
var query_bus_1 = require("./data/queries/query-bus");
var mutation_bus_1 = require("./data/mutations/mutation-bus");
var data_1 = require("./data");
var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var winston = require("winston");
var i18n = require("i18n");
var config_1 = require("./config");
// ACTIVITIES
var activities_1 = require("./activities");
activities_1.addActivities();
// middlewares
var middlewares_1 = require("./middlewares");
// Routes
var routes_1 = require("./routes");
// Setup winston
winston.level = process.env.LOG_LEVEL || 'debug';
winston.add(winston.transports.File, { filename: 'app.log' });
winston.cli();
// Seeding database
var seed_1 = require("./data/seed");
seed_1["default"]();
// adding custom validators
data_1.addDuplicateValidator();
var GRAPHQL_PORT = 9091;
var graphQLServer = express();
graphQLServer.use('*', cors());
// enable parsing
graphQLServer.use(bodyParser.urlencoded({ extended: false }));
graphQLServer.use(bodyParser.json());
// middlewares
// enable logger
graphQLServer.use(middlewares_1.logger);
// validate tokens
graphQLServer.use(middlewares_1.tokenValidator);
// initialize master and app context
graphQLServer.use(middlewares_1.initializeContexts);
// i8n
i18n.configure({
    directory: __dirname + '/resources/i18n',
    defaultLocale: 'en',
    objectNotation: true
});
graphQLServer.use(i18n.init);
//  GRAPHQL
// import makeDefaultConnection from './data/nova-connector';
var graphql_server_express_1 = require("graphql-server-express");
var apollo_server_1 = require("apollo-server");
var graphql_tools_1 = require("graphql-tools");
var graphql_schema_1 = require("./data/graphql/graphql-schema");
// import Mocks from './data/mocks';
var executableSchema = graphql_tools_1.makeExecutableSchema({
    typeDefs: graphql_schema_1.GraphqlSchema.schema,
    resolvers: graphql_schema_1.GraphqlSchema.resolvers,
    allowUndefinedInResolve: true
});
// addMockFunctionsToSchema({
//   schema: executableSchema,
//   mocks: Mocks,
//   preserveResolvers: true,
// });
// Routes
graphQLServer.use('/auth', routes_1.auth);
graphQLServer.use('/graphql', bodyParser.json(), graphql_server_express_1.graphqlExpress(function (req) { return ({
    context: {
        config: config_1.config,
        req: req,
        mutationBus: mutation_bus_1.getMutationBusSingleton(),
        queryBus: query_bus_1.getQueryBusSingleton()
    },
    schema: executableSchema
}); }));
graphQLServer.use('/graphiql', apollo_server_1.graphiqlExpress({
    endpointURL: '/graphql'
}));
// first of all make sure we can connecto to mongo db
graphQLServer.listen(GRAPHQL_PORT, function () { return console.log("GraphQL Server is now running on http://localhost:" + GRAPHQL_PORT + "/graphql"); });
//# sourceMappingURL=index.js.map