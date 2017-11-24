import { GraphqlMetaType } from './graphql-meta-types.enum';
import { GraphQLArtifact } from './graphql-artifact';
import { updateMetadata } from './helpers';
import * as Hbs from 'handlebars';

export interface GraphQLTypeDecoratorOptions {
    name?: string;
}

export function type(definition?: GraphQLTypeDecoratorOptions) {
    return function(target) {
        // create input graphql definition
        const typeTemplateText = `type {{typeName}} {
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
        const graphQlType = Hbs.compile(typeTemplateText)(payload);

        updateMetadata(target, null, 'gqlArtifact', { type: GraphqlMetaType.Type, name: name } as GraphQLArtifact);
        updateMetadata(target, null, 'definition', graphQlType);
    };
}