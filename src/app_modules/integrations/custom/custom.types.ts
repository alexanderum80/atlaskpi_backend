import { ErrorDetails } from '../../../framework/graphql/common.types';
import { type } from '../../../framework/decorators/type.decorator';
import { field } from '../../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { input } from '../../../framework/decorators/input.decorator';


@input()
export class ICustomModelInput {
    @field({ type: GraphQLTypesMap.String })
    columnName: string;

    @field({ type: GraphQLTypesMap.String })
    dataType: string;
}

@input()
export class ICustomInput {
    @field({ type: GraphQLTypesMap.String })
    inputName: string;

    @field({ type: ICustomModelInput, isArray: true })
    fields: ICustomModelInput[];

    @field({ type: GraphQLTypesMap.String })
    records: string;
}

@type()
export class ICustomResponse {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}