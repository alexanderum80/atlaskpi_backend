
import { input, type, field, GraphQLTypesMap } from '../../framework';


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

