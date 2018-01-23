import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';
import { difference } from 'lodash';

import { input } from '../../../framework/decorators/input.decorator';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { ITagModel } from './tag';

export const TagSchema = new mongoose.Schema({
    name: { type: String, unique: true }
});

TagSchema.statics.saveNewTags = function(tags: string[]) {
    if (!tags) {
        return;
    }

    const Tag: ITagModel = this;
    Tag.find({ name: { $in: tags } }).then(tagsFound => {
        if (tagsFound.length === tags.length) {
            return;
        }

        if (!tagsFound) {
            tagsFound = [];
        }

        const tagsFoundNames: string[] = tagsFound.map(t => t.name);
        const newTags = difference(tags, tagsFoundNames).map(t => ({ name: t }));

        if (newTags[0]) {
            Tag.insertMany(newTags).then(tagsInserted => {
                console.log(`${tagsInserted.length} tags inserted`);
            })
            .catch(err => {
                console.error('There was an error inserting new tags');
            });
        }

    });
};


@injectable()
export class Tags extends ModelBase<ITagModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Tag', TagSchema, 'tags');
    }
}