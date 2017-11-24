import { IActivity } from '../authorization';
import { GraphqlMetaType } from './graphql-meta-types.enum';
import { GraphQLArtifact } from './graphql-artifact';
import { updateMetadata } from './helpers';
import { MetadataFieldsMap } from './metadata-fields.map';
import * as Hbs from 'handlebars';

export interface GraphQLQueryDecoratorOptions {
    name?: string;
    activity: IActivity | [IActivity];
    parameters: any[];
    output: any;
}

export function query(definition: GraphQLQueryDecoratorOptions) {
    return (target) => {
        const name = definition.name || target.name;
        const parameters = definition.parameters.map(p => `${p.name}: ${p.type.name}`);
        const inputTemplateText = `{{queryName}}({{#each parameters}}{{this}}{{/each}}): {{output}}`;
        const payload = {
            queryName: name,
            parameters: definition.parameters.map(p => `${p.name}: ${p.type.name || p.type}${p.required ? '!' : ''}`),
            output: definition.output.name
        };
        const graphQlType = Hbs.compile(inputTemplateText)(payload);

        updateMetadata(target, null, MetadataFieldsMap.Artifact, { type: GraphqlMetaType.Query, name: name } as GraphQLArtifact);
        updateMetadata(target, null, MetadataFieldsMap.Definition, graphQlType);
    };
}