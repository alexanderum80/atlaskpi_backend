import { GraphqlMetaType } from './graphql-meta-types.enum';

export interface GraphQLArtifact {
    type: GraphqlMetaType;
    name: string;
}
