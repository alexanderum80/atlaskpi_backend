import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { ITagDocument, ITagModel } from './tag';

export function tagsPlugin(schema: mongoose.Schema, options?: any) {
    schema.path('tags', [String]);
    schema.statics.filterByTags = filterByTags;
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