import { GraphqlMetaType } from './graphql-meta-types.enum';
import { GraphQLArtifact } from './graphql-artifact';
import { updateMetadata } from './helpers';
import * as Hbs from 'handlebars';

export interface GraphQLInputDecoratorOptions {
    name?: string;
}

export function input(definition?: GraphQLInputDecoratorOptions) {
    return function(target) {
        // create input graphql definition
        const inputTemplateText = `input {{typeName}} {
            {{#each fields}}
            {{this}}
            {{/each}}
        }`;

        if (!definition) {
            definition = {};
        }

        const name = definition.name || target.name;
        const fields = target.prototype.fields;
        const fieldNames = Object.keys(fields);
        const payload = {
            typeName: name,
            fields: fieldNames.map(f => `${f}: ${fields[f]}`)
        };
        const graphQlType = Hbs.compile(inputTemplateText)(payload);

        updateMetadata(target, null, 'gqlArtifact', { type: GraphqlMetaType.Input, name: name } as GraphQLArtifact);
        updateMetadata(target, null, 'definition', graphQlType);
    };
}