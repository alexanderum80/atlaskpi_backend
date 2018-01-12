import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { field } from '../../framework/decorators/field.decorator';
import { type } from '../../framework/decorators/type.decorator';

@type()
export class ImportResult {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.Int })
    total: number;
}