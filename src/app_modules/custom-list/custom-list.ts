import { ErrorDetails } from '../../framework/graphql/common.types';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';

@input()
export class CustomListInput {
    @field({ type: GraphQLTypesMap.String })
    _id?: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    dataType: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    listValue: string[];
}

@type()
export class ICustomListResponse  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id?: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    dataType: string;

    @field({ type: GraphQLTypesMap.String })
    user: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    listValue: string[];
}

@type()
export class CustomListMutationResponse {
    @field({ type: GraphQLTypesMap.Boolean })
    success?: boolean;

    @field({ type: ICustomListResponse })
    entity?: ICustomListResponse;

    @field({ type: ErrorDetails, isArray: true })
    errors?: ErrorDetails[];
}
