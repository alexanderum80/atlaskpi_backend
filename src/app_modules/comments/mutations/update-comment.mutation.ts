import { ICommentInput } from './../../../domain/app/comments/comments';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateCommentActivity } from '../activities/update-comment.activity';
import { Logger } from '../../../domain/app/logger';
import { CommentMutationResponse, CommentInput } from '../comments.types';
import { Comments } from '../../../domain/app/comments/comments.model';

@injectable()
@mutation({
    name: 'updateComment',
    activity: UpdateCommentActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: CommentInput, required: true },
    ],
    output: { type: CommentMutationResponse }
})
export class UpdateCommentMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Comments.name) private _comments: Comments,
        @inject(Logger.name) private _logger: Logger) {
        super();
    }

    run(data: { id: string, input: ICommentInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._comments.model
                .updateComment(data.id, data.input)
                .then((comment) => {
                    resolve({ entity: comment, success: true });
                    return;
                })
                .catch(err => {
                    that._logger.error(err);
                    resolve({ success: false, errors: [ { field: 'comment', errors: [err] } ]});
                    return;
                });
        });
    }
}
