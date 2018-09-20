import { type } from '../../framework/decorators/type.decorator';
import { input } from '../../framework/decorators/input.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { resolver } from '../../framework/decorators/resolver.decorator';


@input()
export class SlideshowInput  {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    charts: string[];

}


@type()
export class Slideshow  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    charts: string[];

}


@type()
export class SlideshowResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Slideshow })
    entity: Slideshow;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

