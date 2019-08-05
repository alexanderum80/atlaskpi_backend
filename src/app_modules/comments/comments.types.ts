import { isArray } from 'util';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';

@input()
export class UserCommentInput {
    @field({ type: GraphQLTypesMap.String })
    id: string;
    @field({ type: GraphQLTypesMap.Boolean })
    read: boolean;
}

@input()
export class CommentChildrenInput {
    @field({ type: UserCommentInput, isArray: true })
    users: UserCommentInput[];

    @field({ type: GraphQLTypesMap.String })
    message: string;

    @field({ type: GraphQLTypesMap.Boolean })
    deleted: boolean;

    @field({ type: GraphQLTypesMap.String })
    createdBy: string;

    @field({ type: GraphQLTypesMap.Date })
    createdDate: Date;
}

@input()
export class CommentInput  {

    @field({ type: GraphQLTypesMap.String, required: true })
    chart: string;

    @field({ type: UserCommentInput, isArray: true, required: true })
    users: UserCommentInput[];

    @field({ type: GraphQLTypesMap.String, required: true })
    message: string;

    @field({ type: GraphQLTypesMap.Boolean })
    deleted: boolean;

    @field({ type: CommentChildrenInput, isArray: true })
    children: CommentChildrenInput[];

    @field({ type: GraphQLTypesMap.String, required: true })
    createdBy: string;

    @field({ type: GraphQLTypesMap.Date, required: true })
    createdDate: Date;
}

@type()
export class UserComment {
    @field({ type: GraphQLTypesMap.String })
    id: string;

    @field({ type: GraphQLTypesMap.Boolean })
    read: boolean;
}

@type()
export class CommentChildren {
    @field({ type: UserComment, isArray: true })
    users: UserComment[];

    @field({ type: GraphQLTypesMap.String })
    message: string;

    @field({ type: GraphQLTypesMap.Boolean })
    deleted: boolean;

    @field({ type: GraphQLTypesMap.String })
    createdBy: string;

    @field({ type: GraphQLTypesMap.Date })
    createdDate: Date;
}

@type()
export class CommentEntityResponse  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    chart: string;

    @field({ type: UserComment, isArray: true })
    users: UserComment[];

    @field({ type: GraphQLTypesMap.String })
    message: string;

    @field({ type: GraphQLTypesMap.Boolean })
    deleted: boolean;

    @field({ type: CommentChildren, isArray: true })
    children: CommentChildren[];

    @field({ type: GraphQLTypesMap.String })
    createdBy: string;

    @field({ type: GraphQLTypesMap.Date })
    createdDate: Date;
}


@type()
export class CommentMutationResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: CommentEntityResponse })
    entity: CommentEntityResponse;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}

