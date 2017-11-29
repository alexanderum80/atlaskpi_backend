import { BRIDGE } from '../decorators/helpers';
import { MetadataFieldsMap } from '../decorators/metadata-fields.map';
import {
    GraphqlDefinition
} from './graphql-definition';
import _ = require('lodash');
import * as logger from 'winston';
import {
    IAppModule, MetadataType
} from '../index';
import { makeExecutableSchema } from 'graphql-tools';
import { IExecutableSchemaDefinition } from 'graphql-tools/dist/Interfaces';

export function makeGraphqlSchemaExecutable(modules: IAppModule[]): IExecutableSchemaDefinition {
    const resolvers = [];

    const inputKeys = Object.keys(BRIDGE.graphql.inputs);
    const inputs = inputKeys.map(key => BRIDGE.graphql.inputs[key].text);

    const typeKeys = Object.keys(BRIDGE.graphql.types);
    const types = Object.keys(BRIDGE.graphql.types).map(key => {
        return {
            name: key,
            text: BRIDGE.graphql.types[key].text,
            resolver: _getTypeResolver(BRIDGE.graphql.types[key].constructor)
        };
    });

    const moduleNames = Object.keys(BRIDGE.modules);
    const mutationAndQueries = {
        mutations: [],
        queries: []
    };
    [MetadataType.Mutations, MetadataType.Queries].forEach(t => {
        const typeKeys = Object.keys(BRIDGE.graphql[t]);
        // mutationKeys.map(key => BRIDGE.graphql.mutations[key].text);

        moduleNames.forEach(m => {
            const appModule = BRIDGE.modules[m];
            const moduleQueriesOrMutations = appModule[t];
            const queryOrMutationKeys = Object.keys(moduleQueriesOrMutations);
            mutationAndQueries[t] = queryOrMutationKeys.map(queryOrMutation => moduleQueriesOrMutations[queryOrMutation]);
        });
    });

    const schema = `
    ${inputs.join('\n')}

    ${types.map(t => t.text).join('\n')}

    type Mutation {
        ${mutationAndQueries.mutations.map(m => m.text).join('\n')}
    }

    type Query {
        ${mutationAndQueries.queries.map(q => q.text).join('\n')}
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

function _getTypeResolver(constructorFunction: any): any {
    
}