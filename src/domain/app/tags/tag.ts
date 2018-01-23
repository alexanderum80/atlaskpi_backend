import * as mongoose from 'mongoose';

export interface ITag {
    name: string;
}

export interface ITagDocument extends ITag, mongoose.Document { }

export interface ITagModel extends mongoose.Model<ITagDocument> {
    saveNewTags(tags: string[]);
}