import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { ITagDocument, ITagModel } from './tag';
import { setTimeout } from 'timers';
import { TagSchema } from './tag.model';

export function tagsPlugin(schema: mongoose.Schema, options?: any) {
    schema.path('tags', [String]);
    schema.statics.filterByTags = filterByTags;

    ['save', 'create', 'findOneAndUpdate'].forEach(method => {
        schema.post(method, function(doc) {
            // get a reference to the tags model
            const Tag = (doc as any).db.model('Tag', TagSchema, 'tags');
            Tag.saveNewTags((doc as any).tags);
        });
    });
}

function filterByTags(tags: string[]): Promise<ITagDocument[]> {
    const that = this as ITagModel;

    return new Promise<ITagDocument[]>((resolve, reject) => {
        that.find({ tags: { $in: tags } }, (err, tags: ITagDocument[]) => {
            if (err) {
                return reject(err);
            }

            resolve(tags);
        });
    });
}