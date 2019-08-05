import { AddChildrenCommentActivity } from '../activities/addChildren-comment.activity';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { Logger } from '../../../domain/app/logger';
import { ICommentsChildren } from '../../../domain/app/comments/comments';
import { Comments } from '../../../domain/app/comments/comments.model';
import { CommentChildrenInput } from '../comments.types';

@injectable()
@query({
    name: 'addChildrenComment',
    activity: AddChildrenCommentActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'input', type: CommentChildrenInput }
    ],
    output: { type: String }
})
export class AddChildrenCommentQuery implements IQuery<Boolean> {
    constructor(
        @inject(Comments.name) private _comments: Comments,
        @inject('Logger') private _logger: Logger
    ) { }

    run(data: { id: string, input: ICommentsChildren}): Promise<boolean> {
        this._logger.debug('running add children comment query for id:' + data.id);

        const that = this;
        return new Promise<boolean>((resolve, reject) => {
            that._comments.model.update({_id: data.id},
                { $push: { children: data.input }}).exec()
            .then(res => {
                resolve(true);
            })
            .catch(err => {
                that._logger.error(err);
                reject(err);
            });
        });
    }
}
