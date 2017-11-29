import { MetadataFieldsMap } from './metadata-fields.map';

export interface GraphQLResolverDecoratorOptions {
    forField: string;
}

export function resolver(definition?: GraphQLResolverDecoratorOptions) {
    return function(target, method) {

        if (!target[MetadataFieldsMap.Resolvers]) {
            target[MetadataFieldsMap.Resolvers] = {};
        }

        const resolvers = target[MetadataFieldsMap.Resolvers];

        if (resolvers[definition.forField]) {
            throw new Error(`You already defined a resolver for ${definition.forField} on ${target.name}`);
        }

        resolvers[definition.forField] = target[method];
    };
}