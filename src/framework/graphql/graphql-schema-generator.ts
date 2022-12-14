import { gql } from 'apollo-server-express';
import { DocumentNode } from 'graphql';
import { IResolvers } from 'graphql-tools/dist/Interfaces';

import { IAppModule } from '../decorators/app-module';
import { BRIDGE, MetadataType } from '../decorators/helpers';
import { resolver } from '../decorators/resolver.decorator';
import { dateScalarType } from './custom-types';



interface ITypeDetails {
    name: string;
    text: string;
    resolver: {
        [name: string]: Function;
    };
}

interface IMutationAndQueries {
    mutations: any[];
    queries: any[];
}

export interface ITypesAndResolvers {
    typeDefs?: DocumentNode;
    resolvers?: IResolvers;
}

export function makeGraphqlSchemaExecutable(modules: IAppModule[]): ITypesAndResolvers {
    // const resolvers = [];

    const inputKeys = Object.keys(BRIDGE.graphql.inputs);
    const inputs = inputKeys.map(key => BRIDGE.graphql.inputs[key].text);

    // const typeKeys = Object.keys(BRIDGE.graphql.types);
    const types: ITypeDetails[] = Object.keys(BRIDGE.graphql.types).map(key => {
        const typeRef = BRIDGE.graphql.types[key];
        return {
            name: key,
            text: typeRef.text,
            resolver: typeRef.resolvers
        };
    });

    const moduleNames = Object.keys(BRIDGE.modules);
    const mutationAndQueries: IMutationAndQueries = {
        mutations: [],
        queries: []
    };
    [MetadataType.Mutations, MetadataType.Queries].forEach(t => {
        const typeKeys = Object.keys(BRIDGE.graphql[t]);
        // mutationKeys.map(key => BRIDGE.graphql.mutations[key].text);

        moduleNames.forEach(m => {
            const appModule = BRIDGE.modules[m];
            const moduleQueriesOrMutations = appModule[t];

            if (!moduleQueriesOrMutations) return;

            const queryOrMutationKeys = Object.keys(moduleQueriesOrMutations);
            mutationAndQueries[t] = mutationAndQueries[t].concat(queryOrMutationKeys.map(queryOrMutation => moduleQueriesOrMutations[queryOrMutation]));
        });
    });

    const schema = `

    scalar ${dateScalarType.name}

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

    // return makeExecutableSchema({
    //     typeDefs: [schema],
    //     resolvers: mergeModuleResolvers({}, types, mutationAndQueries),
    //     allowUndefinedInResolve: true,
    //     //   printErrors: true,
    // });

    return {
        typeDefs: gql(schema),
        resolvers: mergeModuleResolvers({}, types, mutationAndQueries),
    };
}

// --- MERGE RESOLVERS
function mergeModuleResolvers(baseResolvers, types: ITypeDetails[], mutationAndQueries: IMutationAndQueries) {

    const resolvers = {};

    // add custom scalar types
    resolvers[dateScalarType.name] = dateScalarType.resolver;

    // complex type resolvers
    types.forEach(t => {
        if (t.resolver) {

            if (!resolvers[t.name]) {
                resolvers[t.name] = {};
            }

            const objectResolvers = resolvers[t.name];

            for (let resolverKey in t.resolver) {
                objectResolvers[resolverKey] = t.resolver[resolverKey];
            }
        }
    });

    // mutation and queries resolvers
    [MetadataType.Mutations, MetadataType.Queries].forEach(metadataType => {
        if (!mutationAndQueries[metadataType] || mutationAndQueries[metadataType].length === 0) {
            return;
        }

        const resolverType = metadataType === MetadataType.Mutations ? 'Mutation' : 'Query';
        const target = resolvers[resolverType] = {};

        mutationAndQueries[metadataType].forEach(queryOrMutation => {
            target[queryOrMutation.name] = queryOrMutation.resolver;
        });
    });

    return resolvers;
}