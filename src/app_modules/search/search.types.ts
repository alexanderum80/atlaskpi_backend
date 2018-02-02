import { type } from '../../framework/decorators/type.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';

@type()
export class SearchResultItem  {
    @field({ type: GraphQLTypesMap.String })
    section: string;

    @field({ type: GraphQLTypesMap.String })
    data: string;

}

