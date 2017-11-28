import { MetadataFieldsMap } from './metadata-fields.map';
import {
    addGlobalModuleMetadata,
    getGraphqlMetadata,
    IArtifactDetails,
    IGraphqlArtifacts,
    IModuleMetadata,
    IQueryOrMutationDetails,
    MetadataType,
    updateMetadata,
} from './helpers';
import {
    IQuery
} from '../queries/query';
import {
    IMutation
} from '../mutations/mutation';
import {
    Container,
    ContainerModule,
    interfaces
} from 'inversify';
import { IGraphqlContext } from '../graphql';
import { GraphqlMetaType } from './graphql-meta-types.enum';

export interface IDIRegistrator {
    bind: interfaces.Bind;
    unbind: interfaces.Unbind;
    isBound: interfaces.IsBound;
    rebind: interfaces.Rebind;
}

export interface IAppModule {
    registerDependencies(container: IDIRegistrator);
}

export class ModuleBase implements IAppModule {
    registerDependencies(container: IDIRegistrator) {
        // do nothing by default
    }
}


export interface IModuleOptions {
    imports ? : Array < new() => IAppModule > ; // IModuleOptions[];
    queries ? : Array < new(...args) => IQuery < any >> ;
    mutations ? : Array < new(...args) => IMutation < any >> ;
}

export function Module(options: IModuleOptions) {
    return function(target) {
        // save a reference to the original constructor
        const original = target;

        // a utility function to generate instances of a class
        function construct(constructor, args) {
            const c: any = function() {
                const instance = constructor.apply(this, args);
                // this parameter comes when when the framework bootstrap this module
                const container = args[0];

                if (options.mutations || options.queries) {
                    const moduleMetadata = _getModuleMetadata(target, instance, container, options);
                    _processDependencyInjection(constructor.name, moduleMetadata, instance, container, options);
                    _injectResolvers(container, moduleMetadata);
                    addGlobalModuleMetadata(target, moduleMetadata);
                }

                return instance;
            };

            c.prototype = constructor.prototype;
            return new c();
        }

        // the new constructor behaviour
        const f: any = function(...args) {
            return construct(original, args);
        };

        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;

        updateMetadata(f, null, MetadataFieldsMap.Definition, options);

        // return new constructor (will override original)
        return f;
    };
}

function _getModuleMetadata(target, instance, container: Container, options: IModuleOptions): IModuleMetadata {
    const result: IModuleMetadata = {
        constructor: target
    };

    // add queries & mutations to the module
    [MetadataType.Queries, MetadataType.Mutations].forEach(queriesOrMutations => {
        if (options[queriesOrMutations]) {
            const names = options[queriesOrMutations].map(q => q.name);
            const artifacts = getGraphqlMetadata(queriesOrMutations, names);

            if (artifacts) {
                result[queriesOrMutations] = {};
                artifacts.forEach(a => result[queriesOrMutations][a.constructor.name] = a);
            }
        }
    });

    // children modules
    // TODO: Pending to implement nested modules

    return result;
}

// function _constructGraphQLSchema(schemaArtifacts, container: Container, name: string, options: IModuleOptions) {
//     const result: GraphqlDefinition = {
//         name: name,
//         schema: {} as GraphqlSchema,
//         resolvers: {}
//     };

//     // create graphql types, queries and mutations definitions
//     result.schema.types = _concatenateType(schemaArtifacts, [GraphqlMetaType.Input, GraphqlMetaType.Type]);
//     result.schema.queries = _concatenateType(schemaArtifacts, [GraphqlMetaType.Query]);
//     result.schema.mutations = _concatenateType(schemaArtifacts, [GraphqlMetaType.Mutation]);

//     // create resolvers
//     result.resolvers.Query = _createResolversFor(container, GraphqlMetaType.Query, schemaArtifacts, options);
//     result.resolvers.Mutation = _createResolversFor(container, GraphqlMetaType.Mutation, schemaArtifacts, options);
//     // TODO: I need to finish this
//     // Object.assign(result.resolvers, _createComplexTypeResolvers(schemaArtifacts, options));

//     return result;
// }

function _processDependencyInjection(moduleName: string,
    moduleMetadata: IModuleMetadata,
    instance: any,
    container: Container,
    options: IModuleOptions): void {
    // create container module to group registrations
    const diModule = new ContainerModule((
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind) => {

        // auto register queries and mutations with the dependency injector container
        [MetadataType.Queries, MetadataType.Mutations].forEach(t => {
            if (moduleMetadata[t]) {
                Object.keys(moduleMetadata[t]).forEach(m => {
                    const a: IArtifactDetails = moduleMetadata[t][m];
                    bind(a.constructor.name).to(a.constructor);
                });
            }
        });

        instance.registerDependencies({
            bind: bind,
            unbind: unbind,
            isBound: isBound,
            rebind: rebind
        });
    });

    container.load(diModule);
}

function _injectResolvers(container: Container, moduleMetadata: IModuleMetadata): void {
    // type resolvers

    // query and mutation resolvers
    [MetadataType.Queries, MetadataType.Mutations].forEach(metadataType => {
        const types = moduleMetadata[metadataType];

        if (types) {
            for (const key in types) {
                const queryOrMutation: IQueryOrMutationDetails = <IQueryOrMutationDetails>types[key];
                const i = container.get(queryOrMutation.constructor.name) as any;
                (<IQueryOrMutationDetails>types[key]).resolver = _getResolverFunction(metadataType, container, queryOrMutation);
            }
        }
    });
}

// function _concatenateType(list, types: GraphqlMetaType[]): string {
//     let result = '';

//     list.filter(a => types.indexOf(a.type) !== -1)
//         .forEach(a => {
//             result += a.definition + '\n';
//         });

//     return result;
// }

function _getResolverFunction(metaType: MetadataType, container: Container, artifact: IQueryOrMutationDetails) {
    const bus = metaType === MetadataType.Queries ? 'queryBus' : 'mutationBus';

    return function _executeResolver(root: any, args, ctx: IGraphqlContext) {
        // get an intance using the dependency injection container
        const i = container.get(artifact.constructor.name) as any;
        // ejecute the query or mutation bus
        return (ctx[bus] as any).run(artifact.activity, ctx.req, i, args);
    };
}

// function _createComplexTypeResolvers(schemaArtifacts: ISchemaArtifactDetails[], options: IModuleOptions) {
//     throw new Error('Not implemented');
// }