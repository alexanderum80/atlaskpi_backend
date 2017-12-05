
import { input, type, field, GraphQLTypesMap } from '../../framework';


@type()
export class DataSourceField  {
    @field({ type: GraphQLTypesMap.String })
    path: string;

    @field({ type: GraphQLTypesMap.String })
    type: string;

}


@type()
export class DataSourceResponse  {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: DataSourceField, isArray: true })
    fields: DataSourceField[];

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings: string[];

}

