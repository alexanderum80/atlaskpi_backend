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

export interface GraphQLInputDecoratorOptions {
    name?: string;
}

export function input(definition?: GraphQLInputDecoratorOptions) {
    return function(target) {
        processInputAndType(MetadataType.Inputs, target, definition);
    };
}