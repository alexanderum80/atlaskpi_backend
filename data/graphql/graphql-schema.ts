import { industriesGql } from './master/industries.gql';
import { spreadsheetGpl } from './master/import-from-spreadsheet';
// from: https://gist.github.com/icebob/553c1f9f1a9478d828bcb7a08d06790a

import { GraphqlDefinition } from './graphql-definition';
import _ = require('lodash');
import * as logger from 'winston';

// import definitions
import { accountsGql } from './master';
import { usersGql, kpisGql, commonGql,
         // businessUnitsGql,
         chartFormatGql, chartsGql, dashboardGql, searchGql, rolesGql, permissionGql } from './app';

// let files = getGlobbedFiles(path.join(__dirname, '**', '*.gql.ts'));
let definitions: GraphqlDefinition[] = [];
definitions.push(commonGql);
definitions.push(accountsGql);
definitions.push(usersGql);
definitions.push(kpisGql);
// definitions.push(businessUnitsGql);
definitions.push(chartFormatGql);
definitions.push(chartsGql);
definitions.push(dashboardGql);
definitions.push(spreadsheetGpl);
definitions.push(industriesGql);
definitions.push(searchGql);
definitions.push(rolesGql);
definitions.push(permissionGql);

let moduleQueries = [];
let moduleTypes = [];
let moduleMutations = [];
let moduleResolvers = [];

definitions.forEach((definition) => {
    logger.debug(`loading gql definition for: ${definition.name}`);

    moduleQueries.push(definition.schema.queries);
    moduleTypes.push(definition.schema.types);
    moduleMutations.push(definition.schema.mutations);

    moduleResolvers.push(definition.resolvers);
});

const schema = `
type Query {
    ${moduleQueries.join('\n')}
}

${moduleTypes.join('\n')}

type Mutation {
    ${moduleMutations.join('\n')}
}
schema {
  query: Query
  mutation: Mutation
}
`;

// logger.debug('Full gql definition: ' + schema);

// --- MERGE RESOLVERS

function mergeModuleResolvers(baseResolvers) {
    moduleResolvers.forEach((module) => {
        baseResolvers = _.merge(baseResolvers, module);
    });

    return baseResolvers;
}

export const GraphqlSchema = {
    schema: [schema],
    resolvers: mergeModuleResolvers({})
};

