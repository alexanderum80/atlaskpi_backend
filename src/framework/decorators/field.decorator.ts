import { MetadataFieldsMap } from './metadata-fields.map';

export interface GraphQLFieldDecoratorOptions {
    type: any;
    name?: string;
    isArray?: boolean;
    required?: boolean;
}

export function field(definition?: GraphQLFieldDecoratorOptions) {
    return function(target, property) {
        let typeName = definition.type.name || definition.type;

        if (definition.isArray) {
            typeName = `[${typeName}]`;
        }

        if (definition.required) {
            typeName += '!';
        }

        if (!target[MetadataFieldsMap.Fields]) {
            target[MetadataFieldsMap.Fields] = {};
        }

        const fields = target[MetadataFieldsMap.Fields];
        const name = definition.name || property;

        if (fields[name]) {
            throw new Error(`You already defined ${name} on ${target.name}`);
        }

        fields[name] = typeName;

    };
}