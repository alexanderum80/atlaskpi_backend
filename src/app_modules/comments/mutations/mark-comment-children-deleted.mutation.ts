import { inject, injectable } from 'inversify';
import { Logger } from '../../../domain/app/logger';
import { Comments } from '../../../domain/app/comments/comments.model';
import { MarkCommentChildrenDeletedActivity } from '../activities/mark-comment-children-deleted.activity';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';

@injectable()
@mutation({
    name: 'markCommentChildrenDeleted',
    activity: MarkCommentChildrenDeletedActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'children', type: String },
    ],
    output: { type: String }
})
export class MarkCommentChildrenDeletedMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Comments.name) private _comments: Comments,
        @inject('Logger') private _logger: Logger
    ) { super(); }

    async run(data: { id: string, children: string }): Promise<any> {
        this._logger.debug('running mark comment children deleted mutation for id:' + data.id);

        const that = this;
        const comment = await that._comments.model.findOne({_id: data.id });
        comment.children.map(c => {
            if ((<any>c).id === data.children) { c.deleted = true; }
        });
        return new Promise<any>((resolve, reject) => {
            that._comments.model.update(
                {_id: data.id},
                { $set: { children: comment.children}}
                ).exec()
            .then(res => {
                return resolve(true);
            })
            .catch(err => {
                that._logger.error(err);
                reject(err);
            });
        });
    }
}
