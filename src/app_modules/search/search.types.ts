
import { input, type, field, GraphQLTypesMap } from '../../framework';


@type()
export class SearchResultItem  {
    @field({ type: GraphQLTypesMap.String })
    section: string;

    @field({ type: GraphQLTypesMap.String })
    data: string;

}

