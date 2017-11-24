import { updateMetadata } from './helpers';

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
        updateMetadata(target, 'fields', definition.name || property, typeName);
    };
}