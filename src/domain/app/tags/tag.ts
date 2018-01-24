import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface ITag {
    name: string;
}

export interface ITagDocument extends ITag, mongoose.Document { }

export interface ITagModel extends mongoose.Model<ITagDocument> {
    getAll(): Promise<ITagDocument[]>;
    saveNewTags(tags: string[]);
}