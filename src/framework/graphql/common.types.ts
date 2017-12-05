import { type, field, GraphQLTypesMap } from '../../framework';

@type()
export class ErrorDetails {
    @field({ type: GraphQLTypesMap.String })
    field: string;

    @field({ type: GraphQLTypesMap.String, isArray: true, required: true })
    errors: string[];
}