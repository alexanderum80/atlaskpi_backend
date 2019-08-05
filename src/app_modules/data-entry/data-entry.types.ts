import { isArray } from 'util';
import { type } from '../../framework/decorators/type.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { any } from 'bluebird';

@input()
export class IDataEntryModelInput {
    @field({ type: GraphQLTypesMap.String })
    columnName: string;

    @field({ type: GraphQLTypesMap.String })
    dataType: string;
}

@input()
export class IDataEntryInput {
    @field({ type: GraphQLTypesMap.String })
    inputName: string;

    @field({ type: GraphQLTypesMap.String })
    fields: string;

    @field({ type: GraphQLTypesMap.String })
    records: string;

    @field({ type: GraphQLTypesMap.String })
    dateRangeField: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    users: string[];
}

@type()
export class DataEntryField  {
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
export class DataEntryFilterOperator {
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
export class DataEntryTypeFilters {
    @field({ type: DataEntryFilterOperator, isArray: true })
    Number: DataEntryFilterOperator[];

    @field({ type: DataEntryFilterOperator, isArray: true })
    String: DataEntryFilterOperator[];
}

@type()
export class DataEntryResponse  {
    @field({ type: GraphQLTypesMap.String })
    _id?: string;
    @field({ type: GraphQLTypesMap.String })
    id?: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String })
    dataSource: string;

    @field({ type: GraphQLTypesMap.Boolean })
    externalSource?: boolean;

    @field({ type: DataEntryField, isArray: true })
    fields: DataEntryField[];

    @field({ type: DataEntryTypeFilters })
    filterOperators: DataEntryTypeFilters;

    @field({ type: GraphQLTypesMap.String, isArray: true})
    sources?: string[];

    @field({ type: GraphQLTypesMap.Boolean })
    dataEntry: boolean;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    users: string[];

    @field({ type: GraphQLTypesMap.String })
    createdBy: string;

    @field({ type: GraphQLTypesMap.String })
    invalidRows?: string;
}

@type()
export class IDataEntryMutationError {
    @field({ type: String })
    field: string;

    @field({ type: String, isArray: true })
    errors: string[];
}

@type()
export class DataEntryMutationResponse extends DataEntryResponse {
    @field({ type: GraphQLTypesMap.Boolean })
    success?: boolean;

    @field({ type: DataEntryResponse })
    entity?: DataEntryResponse;

    @field({ type: IDataEntryMutationError, isArray: true })
    errors?: IDataEntryMutationError[];
}

@type()
export class RemoveDataEntryResult {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: GraphQLTypesMap.String })
    entity?: string;

    @field({ type: ErrorDetails, isArray: true })
    errors?: ErrorDetails[];
}
