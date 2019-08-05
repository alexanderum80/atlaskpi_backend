import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';
import { ISearchableModel } from '../global-search/global-search';

export interface IUserComment {
    id: string;
    read: boolean;
}

export interface ICommentsChildren {
    users: IUserComment[];
    message: string;
    deleted: boolean;
    createdBy: string;
    createdDate: Date;
}

export interface IComment {
    chart: string;
    users: IUserComment[];
    message: string;
    deleted: boolean;
    children: ICommentsChildren[];
    createdBy: string;
    createdDate: Date;
}

export interface ICommentInput {
    chart: string;
    users: IUserComment[];
    message: string;
    deleted: boolean;
    children: ICommentsChildren[];
    createdBy: string;
    createdDate: Date;
}

export interface ICommentDocument extends IComment, mongoose.Document {
    isStacked(): boolean;
}

export interface ICommentsModel extends mongoose.Model<ICommentDocument>, ISearchableModel {
    /**
     * Create a Comment
     * @param { ICommentInput } input - and input object with the details of the comment
     * @returns {Promise<ICommentDocument>}
     */
    createComment(input: ICommentInput): Promise<ICommentDocument>;
    /**
     * Update a comment
     * @param { string } id - and input object with the details of the comment
     * @param { ICommentInput } input - and input object with the details of the comment
     * @returns {Promise<ICommentDocument>}
     */
    updateComment(id: string, input: ICommentInput): Promise<ICommentDocument>;

}
