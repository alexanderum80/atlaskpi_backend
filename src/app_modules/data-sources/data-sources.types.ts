import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';


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

