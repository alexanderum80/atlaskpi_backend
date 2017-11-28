import { GraphqlMetaType } from './graphql-meta-types.enum';
import { GraphQLArtifact } from './graphql-artifact';
import {
    getComplexFieldNames,
    MetadataType,
    processInputAndType,
    updateFieldAndTypeMetadata,
    updateMetadata,
} from './helpers';
import { MetadataFieldsMap } from './metadata-fields.map';
import * as Hbs from 'handlebars';

export interface GraphQLTypeDecoratorOptions {
    name?: string;
}

export function type(definition?: GraphQLTypeDecoratorOptions) {
    return function(target) {
        processInputAndType(MetadataType.Types, target, definition);
    };
}