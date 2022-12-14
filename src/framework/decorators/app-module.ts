import { interfaces } from 'inversify';

import { registerDependencies } from '../../../di';
import { IBridgeContainer } from '../di/bridge-container';
import { IGraphqlContext } from '../graphql/graphql-context';
import { IMutation } from '../mutations/mutation';
import { IQuery } from '../queries/query';
import {
    addGlobalModuleMetadata,
    getGraphqlMetadata,
    IArtifactDetails,
    IModuleMetadata,
    IQueryOrMutationDetails,
    MetadataType,
    updateMetadata,
} from './helpers';
import { MetadataFieldsMap } from './metadata-fields.map';

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
    imports ?: Array < new() => IAppModule > ; // IModuleOptions[];
    queries ?: Array < new(...args) => IQuery < any >> ;
    mutations ?: Array < new(...args) => IMutation < any >> ;
}

export function AppModule(options: IModuleOptions) {
    return function(target) {
        // save a reference to the original constructor
        const original = target;

        // a utility function to generate instances of a class
        function construct(constructor, args) {
            const c: any = function() {
                const instance = new constructor(...args); // constructor.apply(this, args);
                // this parameter comes when when the framework bootstrap this module
                const container = args[0] as IBridgeContainer;

                if (options.mutations || options.queries) {
                    const moduleMetadata = _getModuleMetadata(target, instance, options);
                    _processDependencyInjection(constructor.name, moduleMetadata, instance, container, options);
                    _injectResolvers(moduleMetadata);
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

function _getModuleMetadata(target, instance, options: IModuleOptions): IModuleMetadata {
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

function _processDependencyInjection(moduleName: string,
    moduleMetadata: IModuleMetadata,
    instance: any,
    bridgeContainer: IBridgeContainer,
    options: IModuleOptions): void {
    // create container module to group registrations
    // const diModule = bridgeContainer.getSubmodule();

    // auto register queries and mutations with the dependency injector container
    [MetadataType.Queries, MetadataType.Mutations].forEach(queryOrMutation => {
        if (moduleMetadata[queryOrMutation]) {
            Object.keys(moduleMetadata[queryOrMutation]).forEach(metadata => {
                const a: IArtifactDetails = moduleMetadata[queryOrMutation][metadata];
                bridgeContainer.registerPerWebRequest(a.activity);
                bridgeContainer.registerPerWebRequest(a.constructor);
                // bind(a.constructor.name).to(a.constructor);
            });
        }
    });

    // bridgeContainer.addSubmodule(diModule);
}

function _injectResolvers(moduleMetadata: IModuleMetadata): void {
    // type resolvers
    // I do not include type resolvers here because they are generic for the entire application
    // so I inject the type resolvers at the framework level

    // query and mutation resolvers
    [MetadataType.Queries, MetadataType.Mutations].forEach(metadataType => {
        const types = moduleMetadata[metadataType];

        if (types) {
            for (const key in types) {
                const queryOrMutation: IQueryOrMutationDetails = <IQueryOrMutationDetails>types[key];
                // const i = container.get(queryOrMutation.constructor.name) as any;
                (<IQueryOrMutationDetails>types[key]).resolver = _getResolverFunction(metadataType, queryOrMutation);
            }
        }
    });
}

function _getResolverFunction(metaType: MetadataType, artifact: IQueryOrMutationDetails) {
    const bus = metaType === MetadataType.Queries ? 'queryBus' : 'mutationBus';

    return function _executeResolver(root: any, args, ctx: IGraphqlContext) {
        // get an intance using the dependency injection container
        // console.log(`Resolving: ${artifact.constructor.name}`);
        const i = ctx.requestContainer.instance.get(artifact.constructor.name) as any;
        // ejecute the query or mutation bus
        return (ctx[bus] as any).run(artifact.activity, ctx.req, i, args).then(res => {
            return res;
        });
    };
}
