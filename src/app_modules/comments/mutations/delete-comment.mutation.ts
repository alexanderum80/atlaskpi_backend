import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteCommentActivity } from '../activities/delete-comment.activity';
import { CommentMutationResponse } from '../comments.types';
import { Comments } from '../../../domain/app/comments/comments.model';

@injectable()
@mutation({
    name: 'deleteComment',
    activity: DeleteCommentActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: CommentMutationResponse }
})
export class DeleteCommentMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Comments.name) private _comments: Comments) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._comments.model.findOne({ _id: data.id})
            .exec()
            .then((comment) => {
                if (!comment) {
                    reject({ field: 'id', errors: ['Comment not found']});
                    return;
                }
                comment.remove()
                .then(() =>  {
                    resolve({ success: true, entity: comment });
                    return;
                }).catch(err => {
                    resolve({ success: false, errors: [ { field: 'id', errors: [err]} ] });
                    return;
                });
            });
        });
    }
}
