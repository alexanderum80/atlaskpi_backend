import { GraphQLQueryMutationDecoratorOptions } from './query-mutation-options';
import { MetadataFieldsMap } from './metadata-fields.map';
import { GraphqlMetaType } from './graphql-meta-types.enum';
import { GraphQLArtifact } from './graphql-artifact';
import * as Hbs from 'handlebars';

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

    updateMetadata(target, null, MetadataFieldsMap.Artifact, { type: type, name: name } as GraphQLArtifact);
    updateMetadata(target, null, MetadataFieldsMap.Definition, graphQlType);
    updateMetadata(target, null, MetadataFieldsMap.Activity, definition.activity);

    // add only complex types
    const types = [];

    // add types for parameters
    if (definition.parameters) {
        definition.parameters.forEach(p => {
            if (p.type.name) {
                types.push(p.type);
            }
        });
    }

    // add output type
    if (definition.output.name) {
        types.push(definition.output);
    }

    updateMetadata(target, null, MetadataFieldsMap.Types, types);
}