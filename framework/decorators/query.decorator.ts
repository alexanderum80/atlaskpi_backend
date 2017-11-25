import { GraphqlMetaType } from './graphql-meta-types.enum';
import { processQueryAndMutation } from './helpers';
import { GraphQLQueryMutationDecoratorOptions } from './query-mutation-options';

export function query(definition: GraphQLQueryMutationDecoratorOptions) {
    return (target) => {
        processQueryAndMutation(target, GraphqlMetaType.Query, definition);

        // const name = definition.name || target.name;
        // const parameters = definition.parameters.map(p => `${p.name}: ${p.type.name}`);
        // const inputTemplateText = `{{queryName}}({{#each parameters}}{{this}}{{/each}}): {{output}}`;
        // const payload = {
        //     queryName: name,
        //     parameters: definition.parameters.map(p => `${p.name}: ${p.type.name || p.type}${p.required ? '!' : ''}`),
        //     output: definition.output.name
        // };
        // const graphQlType = Hbs.compile(inputTemplateText)(payload);

        // updateMetadata(target, null, MetadataFieldsMap.Artifact, {
        //         type: GraphqlMetaType.Query,
        //         name: name
        //     } as GraphQLArtifact);
        // updateMetadata(target, null, MetadataFieldsMap.Definition, graphQlType);
        // updateMetadata(target, null, MetadataFieldsMap.Activity, definition.activity);

        // // add only complex types
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
    };
}