import { type } from '../decorators/type.decorator';
import { field } from '../decorators/field.decorator';
import { GraphQLTypesMap } from '../decorators/graphql-types-map';

@type()
export class ErrorDetails {
    @field({ type: GraphQLTypesMap.String })
    field: string;

    @field({ type: GraphQLTypesMap.String, isArray: true, required: true })
    errors: string[];
}