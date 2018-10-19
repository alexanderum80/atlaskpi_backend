import { input } from '../../framework/decorators/input.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { resolver } from '../../framework/decorators/resolver.decorator';

@type()
export class NotificationGql  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.Date })
    timestamp: Date;

    @field({ type: GraphQLTypesMap.String })
    status: string;

    @field({ type: GraphQLTypesMap.String })
    message: string;

    @field({ type: GraphQLTypesMap.String })
    deliveryMethod: string;
}

