import { getQueryBusSingleton } from './data/queries/query-bus';
import { getMutationBusSingleton } from './data/mutations/mutation-bus';
import { addDuplicateValidator } from './data';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as winston from 'winston';
import * as i18n from 'i18n';
import { config } from './config';

// ACTIVITIES
import { addActivities } from './activities';
addActivities();

// middlewares
import { tokenValidator, logger, initializeContexts, loadUser } from './middlewares';

// Routes
import { auth } from './routes';

// Setup winston
(winston as any).level = process.env.LOG_LEVEL || 'debug';
winston.add(winston.transports.File, { filename: 'app.log' });
winston.cli();

// Seeding database
import seed from './data/seed';
seed();

// adding custom validators
addDuplicateValidator();

const GRAPHQL_PORT = 9091;

const graphQLServer = express();

graphQLServer.use('*', cors());

// enable parsing
graphQLServer.use(bodyParser.urlencoded({ extended: false }));
graphQLServer.use(bodyParser.json());


// middlewares

// enable logger
graphQLServer.use(logger);
// validate tokens
graphQLServer.use(tokenValidator);
// initialize master and app context
graphQLServer.use(initializeContexts);
// validate token still exist and load user into request
graphQLServer.use(loadUser);

// i8n
i18n.configure({
  directory: __dirname + '/resources/i18n',
  defaultLocale: 'en',
  objectNotation: true
});

graphQLServer.use(i18n.init);

//  GRAPHQL

import { graphqlExpress } from 'graphql-server-express';
import { apolloExpress, graphiqlExpress } from 'apollo-server';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';

import { GraphqlSchema } from './data/graphql/graphql-schema';
// import Mocks from './data/mocks';

const executableSchema = makeExecutableSchema({
  typeDefs: GraphqlSchema.schema,
  resolvers: GraphqlSchema.resolvers,
  allowUndefinedInResolve: true,
//   printErrors: true,
});

// addMockFunctionsToSchema({
//   schema: executableSchema,
//   mocks: Mocks,
//   preserveResolvers: true,
// });

// Routes
graphQLServer.use('/auth', auth, bodyParser.json());


graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress((req) => (
  {
    context: {
      config: config,
      req: req,
      mutationBus: getMutationBusSingleton(),
      queryBus: getQueryBusSingleton()
    },
    schema: executableSchema
  }
)));

graphQLServer.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

// first of all make sure we can connecto to mongo db

graphQLServer.listen(GRAPHQL_PORT, () => console.log(
    `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}/graphql`
));
