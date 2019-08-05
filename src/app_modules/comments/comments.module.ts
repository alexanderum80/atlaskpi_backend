import { CommentsByChartIdQuery } from './querys/commentsByChartId.query';
import { MarkCommentChildrenDeletedMutation } from './mutations/mark-comment-children-deleted.mutation';
import { MarkCommentDeletedMutation } from './mutations/mark-comment-deleted.mutation';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateCommentMutation } from './mutations/create-comment.mutation';
import { DeleteCommentMutation } from './mutations/delete-comment.mutation';
import { UpdateCommentMutation } from './mutations/update-comment.mutation';
import { CommentQuery } from './querys/comment.query';
import { AddChildrenCommentQuery } from './querys/addChildren-comment.query';
import { MarkCommentReadMutation } from './mutations/mark-comment-read.mutation';
import { CommentNotifyMutation } from './mutations/comment-notify.mutation';


@AppModule({
    mutations: [
        CreateCommentMutation,
        DeleteCommentMutation,
        UpdateCommentMutation,
        MarkCommentDeletedMutation,
        MarkCommentChildrenDeletedMutation,
        MarkCommentReadMutation,
        CommentNotifyMutation
    ],
    queries: [
        CommentQuery,
        AddChildrenCommentQuery,
        CommentsByChartIdQuery
    ],
})
export class CommentsModule extends ModuleBase {}