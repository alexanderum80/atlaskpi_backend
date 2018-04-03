import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';


@type()
export class DataSourceField  {
    @field({ type: GraphQLTypesMap.String })
    name?: string;

    @field({ type: GraphQLTypesMap.String })
    path: string;

    @field({ type: GraphQLTypesMap.String })
    type: string;

}


@type()
export class DataSourceResponse  {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    dataSource: string;

    @field({ type: DataSourceField, isArray: true })
    fields: DataSourceField[];

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings: string[];

}

@type()
export class ExternalDataSourceResponse extends DataSourceResponse {
    @field({ type: GraphQLTypesMap.String })
    id: string;

    @field({ type: GraphQLTypesMap.String })
    connectorId: string;

    @field({ type: GraphQLTypesMap.String })
    connectorType: string;
}

