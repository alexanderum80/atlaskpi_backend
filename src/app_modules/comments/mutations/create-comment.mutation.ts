import { inject, injectable } from 'inversify';
import { Logger } from '../../../domain/app/logger';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateCommentActivity } from '../activities/create-comment.activity';
import { CommentMutationResponse, CommentInput } from '../comments.types';
import { Comments } from '../../../domain/app/comments/comments.model';
import { ICommentInput } from '../../../domain/app/comments/comments';

@injectable()
@mutation({
    name: 'createComment',
    activity: CreateCommentActivity,
    parameters: [
        { name: 'input', type: CommentInput, isArray: true },
    ],
    output: { type: CommentMutationResponse }
})
export class CreateCommentMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Comments.name) private _comments: Comments,
        @inject('Logger') private _logger: Logger
    ) {
        super();
    }

    async run(data: { input: ICommentInput[] }): Promise<IMutationResponse> {
        const that = this;
        const commentsPromise: any[] = [];
        data.input.map(i => {
            commentsPromise.push(that._comments.model.createComment(i));
        });
        return new Promise<Object>((resolve, reject) => {
            Promise.all(commentsPromise).then(res => {
                return resolve({ success: true, entity: null });
            })
            .catch(err => {
                that._logger.error(err);
                return resolve({ success: false, errors: [ { field: 'comment', errors: [err] } ]});
            });
        });
    }
}
