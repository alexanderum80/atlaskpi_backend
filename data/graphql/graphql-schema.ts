import { mapsGql } from './app/maps.gql';
import { reportsGql } from './app/reports.gql';
import { businessUnitGql } from './app/business-unit.gql';
import { countriesGql } from './master/countries.gql';
import { departmentsGql } from './app/departments.gql';
import { slideshowGql } from './app/slideshow.gql';
import { employeesGql } from './app/employees.gql';
import { dateRangesGql } from './app/date-ranges.gql';
import { appointmentsGql } from './app/appointments.gql';
import { dataSourcesGql } from './app/data-sources.gql';
import { industriesGql } from './master/industries.gql';
import { spreadsheetGpl } from './master/import-from-spreadsheet';
import { } from '.';
// from: https://gist.github.com/icebob/553c1f9f1a9478d828bcb7a08d06790a

import { GraphqlDefinition } from './graphql-definition';
import _ = require('lodash');
import * as logger from 'winston';

// import definitions
import { accountsGql, connectorGql } from './master';
import { usersGql, kpisGql, commonGql,
         // businessUnitsGql,
         chartFormatGql, chartsGql, dashboardGql, searchGql, rolesGql, permissionGql, targetGql, accessLogGql,
         widgetsGql, locationsGql, socialWidgetsGql } from './app';

// let files = getGlobbedFiles(path.join(__dirname, '**', '*.gql.ts'));
let definitions: GraphqlDefinition[] = [];

definitions.push(commonGql);

// Master
definitions.push(accountsGql);
definitions.push(industriesGql);
definitions.push(countriesGql);
definitions.push(connectorGql);

// App
definitions.push(usersGql);
definitions.push(kpisGql);
// definitions.push(businessUnitsGql);
definitions.push(chartFormatGql);
definitions.push(chartsGql);
definitions.push(dashboardGql);
definitions.push(spreadsheetGpl);
definitions.push(searchGql);
definitions.push(rolesGql);
definitions.push(permissionGql);
definitions.push(dataSourcesGql);
definitions.push(targetGql);
definitions.push(slideshowGql);
definitions.push(employeesGql);

definitions.push(dateRangesGql);
definitions.push(locationsGql);
definitions.push(accessLogGql);
definitions.push(appointmentsGql);
definitions.push(reportsGql);
definitions.push(widgetsGql);
definitions.push(businessUnitGql);
definitions.push(departmentsGql);
definitions.push(mapsGql);
definitions.push(socialWidgetsGql);

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

