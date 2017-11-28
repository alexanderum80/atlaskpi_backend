import { GraphqlMetaType } from './graphql-meta-types.enum';
import { processQueryAndMutation } from './helpers';
import { GraphQLQueryMutationDecoratorOptions } from './query-mutation-options';

export function query(definition: GraphQLQueryMutationDecoratorOptions) {
    return (target) => {
        processQueryAndMutation(target, GraphqlMetaType.Query, definition);
    };
}