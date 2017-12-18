import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';

@type()
export class HistoricalData {
    @field({ type: GraphQLTypesMap.Int })
    value: number;

    @field({ type: GraphQLTypesMap.String})
    period: string;
}

@type()
export class SocialWidget  {
    @field({ type: GraphQLTypesMap.String })
    connectorId: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.Int })
    value: number;

    @field({ type: GraphQLTypesMap.String})
    valueDescription: string;

    @field({ type: GraphQLTypesMap.String})
    type: string;

    @field({ type: HistoricalData })
    historicalData: HistoricalData;

}
