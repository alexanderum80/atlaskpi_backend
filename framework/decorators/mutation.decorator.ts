import { IActivity } from '../authorization';
import { GraphqlMetaType } from './graphql-meta-types.enum';
import { GraphQLArtifact } from './graphql-artifact';
import { updateMetadata } from './helpers';
import { MetadataFieldsMap } from './metadata-fields.map';
import * as Hbs from 'handlebars';

export interface GraphQLMutationDecoratorOptions {
    name?: string;
    activity: IActivity;
    parameters: any[];
    output: any;
}

export function mutation(definition: GraphQLMutationDecoratorOptions) {
    return (target) => {
        const name = definition.name || target.name;
        const parameters = definition.parameters.map(p => `${p.name}: ${p.type.name}`);
        const inputTemplateText = `{{mutationName}}({{#each parameters}}{{this}}{{/each}}): {{output}}`;
        const payload = {
            mutationName: name,
            parameters: definition.parameters.map(p => `${p.name}: ${p.type.name || p.type}${p.required ? '!' : ''}`),
            output: definition.output.name
        };
        const graphQlType = Hbs.compile(inputTemplateText)(payload);

        updateMetadata(target, null, MetadataFieldsMap.Artifact, { type: GraphqlMetaType.Mutation, name: name } as GraphQLArtifact);
        updateMetadata(target, null, MetadataFieldsMap.Definition, graphQlType);

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
    };
}