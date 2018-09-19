
import { makeExecutableSchema } from 'graphql-tools';
import { gql } from 'apollo-server-express';
import { IExecutableSchemaDefinition, IResolvers } from 'graphql-tools/dist/Interfaces';

import { IAppModule } from '../decorators/app-module';
import { BRIDGE, MetadataType } from '../decorators/helpers';
import { resolver } from '../decorators/resolver.decorator';
import { DocumentNode } from 'graphql';


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

// export function getTypesAndResolvers(
//     mutationClasses: i.Newable<IGqlMutation<any>>[], 
//     queryClasses: i.Newable<IGqlQuery<any>>[]): ITypesAndResolvers | null {

//     const inputs = _getInputs().map(input => _getInputMetadata(input));
//     const types = _getTypes().map(type => _getTypeMetadata(type));
//     const mutations = mutationClasses.map(mutation => _getMutationMetadata(mutation));
//     const queries = queryClasses.map(query => _getQueryMetadata(query));

//     if ((!mutations || !mutations.length) && (!queries || !queries.length)) {
//         return null;
//     }

//     // shoe some debug info
//     if (queries && queries.length)
//         console.log(`Queries: ${queries.map(q => q.name).sort().join(', ')}`);

//     if (mutations && mutations.length)
//         console.log(`Mutations: ${mutations.map(q => q.name).sort().join(', ')}`);

//     let schema = `
//     ${inputs.join('\n')}

//     ${types.map(t => t.text).join('\n')}`;

//     if (mutations && mutations.length) {
//         schema += `
//             type Mutation {
//                 ${mutations.map(m => m.text).join('\n')}
//             }`;
//     }

//     if (queries && queries.length) {
//         schema += `
//             type Query {
//                 ${queries.map(q => q.text).join('\n')}
//             }`;
//     }

//     let basicSchema = `
//         schema {
//             query: Query
//             mutation: Mutation
//         }
//     `;

//     if (!queries || !queries.length) {
//         basicSchema = basicSchema.replace('query: Query', '');
//     }

//     if (!mutations || !mutations.length) {
//         basicSchema = basicSchema.replace('mutation: Mutation', '');
//     }

//     schema += basicSchema;

//     const typeDefs = gql(schema);
//     const resolvers = mergeModuleResolvers(types, { mutations, queries });

//     return {
//         resolvers,
//         typeDefs,
//     }
// }


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