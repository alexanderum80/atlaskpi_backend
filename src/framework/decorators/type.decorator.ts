import { MetadataType, processInputAndType } from './helpers';
import { MetadataFieldsMap } from './metadata-fields.map';

export interface GraphQLTypeDecoratorOptions {
    name?: string;
}

export function type(definition?: GraphQLTypeDecoratorOptions) {
    return function(target) {
        const typeDetails = processInputAndType(MetadataType.Types, target, definition);

        // look for type resolvers
        const resolvers = target[MetadataFieldsMap.Resolvers];

        if (resolvers) {
            typeDetails.resolvers = {};
            for (let resolver in resolvers) {
                typeDetails.resolvers[resolver] = resolvers[resolver];
            }
        }
    };
}