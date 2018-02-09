import { type } from '../../framework/decorators/type.decorator';
import { input } from '../../framework/decorators/input.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { ErrorDetails } from '../../framework/graphql/common.types';

@input()
export class SelfBoardingWinzardInput  {
    @field({ type: GraphQLTypesMap.String })
    status: string;

    @field({ type: GraphQLTypesMap.String })
    statePoint: string;

}


@type()
export class SelfBoardingWinzard  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    status: string;

    @field({ type: GraphQLTypesMap.String })
    statePoint: string;

}



@type()
export class UpdateSelfBoardingWinzardResponse  {
    @field({ type: GraphQLTypesMap.String })
    status: string;

    @field({ type: SelfBoardingWinzard })
    entity: SelfBoardingWinzard;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class CreateSelfBoardingWinzardResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: SelfBoardingWinzard })
    entity: SelfBoardingWinzard;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class DeleteSelfBoardingWinzardResponse  {
    @field({ type: GraphQLTypesMap.String })
    success: string;

    @field({ type: SelfBoardingWinzard })
    entity: SelfBoardingWinzard;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

