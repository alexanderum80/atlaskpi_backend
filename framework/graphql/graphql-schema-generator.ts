import { MetadataFieldsMap } from '../decorators/metadata-fields.map';
import {
    GraphqlDefinition
} from './graphql-definition';
import _ = require('lodash');
import * as logger from 'winston';
import {
    IAppModule
} from '../index';
import { makeExecutableSchema } from 'graphql-tools';
import { IExecutableSchemaDefinition } from 'graphql-tools/dist/Interfaces';

export function getGraphqlExecutableSchema(modules: IAppModule[]): IExecutableSchemaDefinition {
    const definitions: GraphqlDefinition[] = modules
        .map(m => m[MetadataFieldsMap.Squema])
        .filter(squema => squema !== undefined);
    const queries = [];
    const types = [];
    const mutations = [];
    const resolvers = [];

    definitions.forEach((definition) => {
        logger.debug(`loading gql definition for: ${definition.name}`);

        queries.push(definition.schema.queries);
        types.push(definition.schema.types);
        mutations.push(definition.schema.mutations);
        resolvers.push(definition.resolvers);
    });

    const schema = `
    type Query {
        ${queries.join('\n')}
    }

    ${types.join('\n')}

    type Mutation {
        ${mutations.join('\n')}
    }
    schema {
      query: Query
      mutation: Mutation
    }
    `;

    return makeExecutableSchema({
        typeDefs: [schema],
        resolvers: mergeModuleResolvers({}, resolvers),
        allowUndefinedInResolve: true,
      //   printErrors: true,
    });
}

// --- MERGE RESOLVERS
function mergeModuleResolvers(baseResolvers, resolvers: any[]) {
    resolvers.forEach((r) => {
        baseResolvers = _.merge(baseResolvers, r);
    });

    return baseResolvers;
}