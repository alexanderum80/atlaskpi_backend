import { ErrorDetails } from '../../../framework/graphql/common.types';
import { type } from '../../../framework/decorators/type.decorator';
import { field } from '../../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { input } from '../../../framework/decorators/input.decorator';

@input()
export class CallRailInput {
    @field({ type: GraphQLTypesMap.String, required: true })
    accountId: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    apiKey: string;
}

@type()
export class CallRailResponse {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}