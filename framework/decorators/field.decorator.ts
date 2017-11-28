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

        // updateMetadata(target, MetadataFieldsMap.Fields, definition.name || property, typeName);
        if (!target[MetadataFieldsMap.Fields]) {
            target[MetadataFieldsMap.Fields] = {};
        }

        const fields = target[MetadataFieldsMap.Fields];
        const name = definition.name || property;
        fields[name] = typeName;

    };
}