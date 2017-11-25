import { IGraphqlContext } from '../graphql/graphql-context';
import { GraphqlMetaType } from './graphql-meta-types.enum';
import { GraphqlDefinition, GraphqlSchema } from '../graphql';
import { updateMetadata } from './helpers';
import { IQuery } from '../queries/query';
import { IMutation } from '../mutations/mutation';
import { MetadataFieldsMap } from './metadata-fields.map';
import * as _ from 'lodash';
import { Container } from 'inversify';

interface ISchemaArtifactDetails {
    type: GraphqlMetaType;
    name: string;
    definition: string;
}

export interface IAppModule {
    registerDependencies(container: Container);
}

export class ModuleBase implements IAppModule {
    registerDependencies(container: Container) {
        // do nothing by default
    }
}


export interface IModuleOptions {
    imports?: Array<new () => IAppModule>; // IModuleOptions[];
    queries?: Array<new (...args) => IQuery<any>>;
    mutations?: Array<new (...args) => IMutation<any>>;
}

export function Module(options: IModuleOptions) {
    return function (target) {
        // save a reference to the original constructor
        const original = target;

        // a utility function to generate instances of a class
        function construct(constructor, args) {
            const c: any = function () {
                const instance = constructor.apply(this, args);
                instance.registerDependencies(args[0]);

                if (options.mutations || options.queries) {
                    this[MetadataFieldsMap.Squema] = _constructGraphQLSchema.apply(this, [args[0], target.name, options]);
                }

                return instance;
            };

            c.prototype = constructor.prototype;
            return new c();
        }

        // the new constructor behaviour
        const f: any = function (...args) {
            return construct(original, args);
        };

        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;

        updateMetadata(f, null, MetadataFieldsMap.Definition, options);

        // return new constructor (will override original)
        return f;
    };
}


function _constructGraphQLSchema(container: Container, name: string, options: IModuleOptions) {
    const result: GraphqlDefinition = {
        name: name,
        schema: {} as GraphqlSchema,
        resolvers: {}
    };

    let schemaArtifacts: ISchemaArtifactDetails[] = [];

    if (options.queries) {
        schemaArtifacts = schemaArtifacts.concat(_processQueriesMutations(options.queries));
    }
    if (options.mutations) {
        schemaArtifacts = schemaArtifacts.concat(_processQueriesMutations(options.mutations));
    }

    // dedup
    schemaArtifacts = dedup(schemaArtifacts, ['type', 'name']);
    result.schema.types = _concatenateType(schemaArtifacts, [GraphqlMetaType.Input, GraphqlMetaType.Type]);
    result.schema.queries = _concatenateType(schemaArtifacts, [GraphqlMetaType.Query]);
    result.schema.mutations = _concatenateType(schemaArtifacts, [GraphqlMetaType.Mutation]);

    // create resolvers
    result.resolvers.Query = _createResolversFor(container, GraphqlMetaType.Query, schemaArtifacts, options);
    result.resolvers.Mutation = _createResolversFor(container, GraphqlMetaType.Mutation, schemaArtifacts, options);
    Object.assign(result.resolvers, _createComplexTypeResolvers(schemaArtifacts, options));

    return result;
}


function _processQueriesMutations(list): ISchemaArtifactDetails[] {
    let result = [];

    list.forEach(q => {
        // save queries
        result.push({
            type: q[MetadataFieldsMap.Artifact].type,
            name: q[MetadataFieldsMap.Artifact].name,
            definition: q[MetadataFieldsMap.Definition]
        });

        // save types
        const types = q[MetadataFieldsMap.Types];
        if (types) {
            types.forEach(t => {
                result.push({
                    type: t[MetadataFieldsMap.Artifact].type,
                    name: t[MetadataFieldsMap.Artifact].name,
                    definition: t[MetadataFieldsMap.Definition]
                });
            });
        }
    });

    return result;
}

function _concatenateType(list, types: GraphqlMetaType[]): string {
    let result = '';

    list.filter(a => types.indexOf(a.type) !== -1 )
        .forEach(a => {
            result += a.definition + '\n';
        });

    return result;
}

function _createResolversFor(container: Container, metaType: GraphqlMetaType, artifacts: ISchemaArtifactDetails[], options: IModuleOptions): any {
    const result = {};
    const searchIn = metaType === GraphqlMetaType.Query ? 'queries' : 'mutations';
    const resolverTypes = artifacts.filter(a => a.type === metaType);

    resolverTypes.forEach(r => {
        const resolverClass = (options[searchIn] as any[]).find(q => q[MetadataFieldsMap.Artifact].name === r.name);
        result[r.name] = _getResolverFunction(container, metaType, resolverClass);
    });

    return result;
}

function _getResolverFunction(container: Container, metaType: GraphqlMetaType, resolverClass: new (...args) => IQuery<any> | IMutation<any>) {
    const bus = metaType === GraphqlMetaType.Query ? 'queryBus' : 'mutationBus';

    return function _executeResolver(root: any, args, ctx: IGraphqlContext) {
        // get an intance using the dependency injection container
        const i = container.get(resolverClass.name);
        // ejecute the query or mutation bus
        return ctx[bus].run(resolverClass[MetadataFieldsMap.Activity], i, args, ctx.req);
    };
}

function _createComplexTypeResolvers(schemaArtifacts: ISchemaArtifactDetails[], options: IModuleOptions) {
    throw new Error('Not implemented');
}


function dedup(list: any[], keyFields: string[]) {
    const obj = {};

    for (let i = 0, len = list.length; i < len; i++ ) {
        const key = keyFields.map(k => list[i][k].toString()).join('____');
        obj[key] = list[i];
    }

    const result = [];
    for (const key in obj )
        result.push(obj[key]);

    return result;
}