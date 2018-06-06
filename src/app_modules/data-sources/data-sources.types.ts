import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';
import { input } from '../../framework/decorators/input.decorator';

@input()
export class DataSourceFieldInput {
    @field({ type: GraphQLTypesMap.String })
    name?: string;

    @field({ type: GraphQLTypesMap.String })
    path: string;

    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.Boolean })
    allowGrouping: boolean;
}


@input()
export class DataSourceFilterFieldsInput {
    @field({ type: GraphQLTypesMap.String })
    dataSource: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    collectionSource: string[];

    @field({ type: DataSourceFieldInput, isArray: true })
    fields: DataSourceFieldInput[];
}


@type()
export class DataSourceField  {
    @field({ type: GraphQLTypesMap.String })
    name?: string;

    @field({ type: GraphQLTypesMap.String })
    path: string;

    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.Boolean })
    allowGrouping: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    available?: boolean;
}

@type()
export class FilterOperator {
    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    oper: string;

    @field({ type: GraphQLTypesMap.String })
    exp: string;

    @field({ type: GraphQLTypesMap.String })
    listSeparator: string;
}

@type()
export class DataTypeFilters {
    @field({ type: FilterOperator, isArray: true })
    Number: FilterOperator[];

    @field({ type: FilterOperator, isArray: true })
    String: FilterOperator[];
}


@type()
export class DataSourceResponse  {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String })
    dataSource: string;

    @field({ type: GraphQLTypesMap.Boolean })
    externalSource?: boolean;

    @field({ type: DataSourceField, isArray: true })
    fields: DataSourceField[];

    @field({ type: DataTypeFilters })
    filterOperators: DataTypeFilters;

    @field({ type: GraphQLTypesMap.String, isArray: true})
    sources?: string[];
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
