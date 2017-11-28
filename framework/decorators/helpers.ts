import { IAppModule, IModuleOptions } from './app-module';
import { GraphQLQueryMutationDecoratorOptions } from './query-mutation-options';
import { MetadataFieldsMap } from './metadata-fields.map';
import { GraphqlMetaType } from './graphql-meta-types.enum';
import { GraphQLArtifact } from './graphql-artifact';
import * as Hbs from 'handlebars';


export interface IArtifactDetails {
    text: string;
    constructor: any;
}

export interface IGraphqlArtifacts {
    [name: string]: IArtifactDetails;
}

export interface IModuleMetadata {
    constructor: new () => IAppModule;
    queries?: IGraphqlArtifacts;
    mutations?: IGraphqlArtifacts;
    children?: IChildrenModules;
}

export interface IModuleArtifact {
    [name: string]: IModuleMetadata;
}

export interface IChildrenModules {
    [name: string]: IModuleArtifact;
}

export interface IFrameworkMetadata {
    graphql: {
        types: IGraphqlArtifacts,
        inputs: IGraphqlArtifacts,
        queries: IGraphqlArtifacts,
        mutations: IGraphqlArtifacts
    };
    modules: IModuleArtifact;
}

const defaultFrameworkMetadata: IFrameworkMetadata = {
    graphql: {
        types: {},
        inputs: {},
        queries: {},
        mutations: {}
    },
    modules: {}
};

export enum MetadataType {
    Types = 'types',
    Inputs = 'inputs',
    Queries = 'queries',
    Mutations = 'mutations'
}

// set default metadata object on framework
(global as any).__bridge__ = defaultFrameworkMetadata;
export const BRIDGE: IFrameworkMetadata = (global as any).__bridge__;

export function updateGlobalGqlMetadata(metadataType: MetadataType, name: string, graphqlText: string, constructor: any) {
    let graphqlArtifact: IGraphqlArtifacts = BRIDGE.graphql[metadataType];

    graphqlArtifact[name] = {
        text: graphqlText,
        constructor: constructor
    };
}

export function addGlobalModuleMetadata(target, metadata: IModuleMetadata) {
    let appModule: IModuleMetadata = BRIDGE.modules[target.name];

    if (!appModule) {
        BRIDGE.modules[target.name] = metadata;
    }
}

export function getGraphqlMetadata(metadataType: MetadataType, names: string[]): IArtifactDetails[] {
    const types: IGraphqlArtifacts = BRIDGE.graphql[metadataType];
    const keys = Object.keys(types);
    const foundKeys = keys.filter(k => names.indexOf(k) !== -1);

    return foundKeys.map(k => types[k]);
}


export function updateMetadata(target, containerName, field, value) {

    if (containerName) {
        let variable = {};
        if (!target.hasOwnProperty(containerName)) {
            Object.defineProperty(target, containerName, {
                configurable: false,
                get: () => variable,
                set: (value) => variable = value
            });
        }

        if (target[containerName][field]) {
            console.error(`I cannot set property ${field} on ${containerName} because it already exist`);
            return;
        }

        target[containerName][field] = value;
    } else {
        let propertyValue;
        if (!target.hasOwnProperty(field)) {
            Object.defineProperty(target, field, {
                configurable: false,
                get: () => propertyValue,
                set: (value) => propertyValue = value
            });
        }

        if (target[field]) {
            return;
        }

        target[field] = value;
    }
}

export function processQueryAndMutation(target: any, type: GraphqlMetaType, definition: GraphQLQueryMutationDecoratorOptions) {
    const name = definition.name || target.name;
    const parameters = definition.parameters.map(p => `${p.name}: ${p.type.name}`);
    const inputTemplateText = `{{name}}({{#each parameters}}{{this}}{{/each}}): {{output}}`;
    const payload = {
        name: name,
        parameters: definition.parameters.map(p => `${p.name}: ${p.type.name || p.type}${p.required ? '!' : ''}`),
        output: definition.output.name
    };
    const graphQlType = Hbs.compile(inputTemplateText)(payload);

    // updateMetadata(target, null, MetadataFieldsMap.Artifact, { type: type, name: name } as GraphQLArtifact);
    // updateMetadata(target, null, MetadataFieldsMap.Definition, graphQlType);
    // updateMetadata(target, null, MetadataFieldsMap.Activity, definition.activity);

    // add only complex types
    // const types = [];

    // // add types for parameters
    // if (definition.parameters) {
    //     definition.parameters.forEach(p => {
    //         if (p.type.name) {
    //             types.push(p.type);
    //         }
    //     });
    // }

    // // add output type
    // if (definition.output.name) {
    //     types.push(definition.output);
    // }

    // updateMetadata(target, null, MetadataFieldsMap.Types, types);

    if (type === GraphqlMetaType.Mutation) {
        updateGlobalGqlMetadata(MetadataType.Mutations, target.name, graphQlType, target);
    } else if (type === GraphqlMetaType.Query) {
        updateGlobalGqlMetadata(MetadataType.Queries, target.name, graphQlType, target);
    }
}


export function dedupObjectArray(list: any[], keyFields: string[]) {
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