import { updateMetadata } from './helpers';
import { MetadataFieldsMap } from './metadata-fields.map';

export interface GraphQLFieldDecoratorOptions {
    type: any;
    name?: string;
    required?: boolean;
}

export function field(definition?: GraphQLFieldDecoratorOptions) {
    return function(target, property) {
        let typeName = definition.type.name || definition.type;
        if (definition.required) {
            typeName += '!';
        }
        updateMetadata(target, MetadataFieldsMap.Fields, definition.name || property, typeName);
    };
}