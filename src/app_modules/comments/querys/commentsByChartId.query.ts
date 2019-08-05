import { CommentsByCharIdActivity } from './../activities/commentsByChartId.activity';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { Logger } from '../../../domain/app/logger';
import { Comments } from '../../../domain/app/comments/comments.model';

@injectable()
@query({
    name: 'commentsByChartId',
    cache: { ttl: 1800 },
    activity: CommentsByCharIdActivity,
    parameters: [
        { name: 'id', type: String }
    ],
    output: { type: String }
})
export class CommentsByChartIdQuery implements IQuery<String> {
    constructor(
        @inject(Comments.name) private _comments: Comments,
        @inject('Logger') private _logger: Logger
    ) { }

    run(data: { id: string}): Promise<String> {
        this._logger.debug('running get comment query for id:' + data.id);

        const that = this;
        return new Promise<string>((resolve, reject) => {
            that._comments.model.find({chart: data.id})
            .then(res => {
                resolve(JSON.stringify(res));
            })
            .catch(err => {
                that._logger.error(err);
                reject(err);
            });
        });
    }
}
