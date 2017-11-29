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