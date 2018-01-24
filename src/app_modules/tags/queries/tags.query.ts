import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ITagDocument } from '../../../domain/app/tags/tag';
import { Tags } from '../../../domain/app/tags/tag.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListTagsActivity } from '../activities/list-tags.activity';
import { Tag } from '../tags.types';


@injectable()
@query({
    name: 'tags',
    activity: ListTagsActivity,
    output: { type: Tag, isArray: true }
})
export class TagsQuery implements IQuery<ITagDocument[]> {
    constructor(@inject(Tags.name) private _tags: Tags) { }

    run(data: { id: string }): Promise<ITagDocument[]> {
        return this._tags.model.getAll();
    }
}
