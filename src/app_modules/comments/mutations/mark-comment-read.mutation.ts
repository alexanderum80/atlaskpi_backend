import { inject, injectable } from 'inversify';
import { Logger } from '../../../domain/app/logger';
import { Comments } from '../../../domain/app/comments/comments.model';
import { MarkCommentReadActivity } from '../activities/mark-comment-read.activity';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';

@injectable()
@mutation({
    name: 'markCommentRead',
    activity: MarkCommentReadActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'user', type: String },
    ],
    output: { type: String }
})
export class MarkCommentReadMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Comments.name) private _comments: Comments,
        @inject('Logger') private _logger: Logger
    ) { super(); }

    async run(data: { id: string, user: string }): Promise<Object> {
        this._logger.debug('running mark comment read mutation for ids:' + data.id);
        const updatePromises: Promise<Object>[] = [];
        const that = this;
        const comments = await that._comments.model.find({});
        const commentsId = data.id.split(',');
        commentsId.map(c => {
            const comment = comments.find(x => x.id === c);
            comment.users.map(u => {
                    if (u.id === data.user) { u.read = true; }
            });
            comment.children.map(ch => {
                ch.users.map(s => {
                    if (s.id === data.user) { s.read = true; }
                });
            });
            updatePromises.push(this.updateComment(comment));
        });

        return new Promise<Object>((resolve, reject) => {
            Promise.all(updatePromises).then(res => {
                if (res.findIndex(r => r === 'false' ) !== -1) {
                    resolve(false);
                } else {
                    resolve(true);
                }
                return;
            })
            .catch(err => {
                reject(err);
            });
        });
    }

    private updateComment(comment) {
        const that = this;
        return new Promise<Object>((resolve, reject) => {
            that._comments.model.update(
                {_id: comment._id},
                { $set: { users: comment.users, children: comment.children}}
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
