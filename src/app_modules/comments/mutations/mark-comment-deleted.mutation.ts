import { inject, injectable } from 'inversify';
import { Logger } from '../../../domain/app/logger';
import { Comments } from '../../../domain/app/comments/comments.model';
import { MarkCommentDeletedActivity } from '../activities/mark-comment-deleted.activity';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';

@injectable()
@mutation({
    name: 'markCommentDeleted',
    activity: MarkCommentDeletedActivity,
    parameters: [
        { name: 'id', type: String }
    ],
    output: { type: String }
})
export class MarkCommentDeletedMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Comments.name) private _comments: Comments,
        @inject('Logger') private _logger: Logger
    ) { super(); }

    async run(data: { id: string }): Promise<any> {
        this._logger.debug('running mark comment deleted mutation for id:' + data.id);

        const that = this;
        const comment = await that._comments.model.findOne({_id: data.id });
        comment.deleted = true;
        comment.children.map(c => { c.deleted = true; });
        return new Promise<any>((resolve, reject) => {
            that._comments.model.update(
                {_id: data.id},
                { $set: { deleted: comment.deleted, children: comment.children}}
                ).exec()
            .then(() => {
                return resolve(true);
            })
            .catch(err => {
                that._logger.error(err);
                return resolve(false);
            });
        });
    }
}
