import { searchPlugin } from '../global-search/global-search.plugin';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as validate from 'validate.js';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { ICommentInput, ICommentDocument, ICommentsModel } from './comments';
import { tagsPlugin } from '../tags/tag.plugin';

let Schema = mongoose.Schema;

const CommentsChildrenSchema = new Schema({
    users: [{
        id: { type: Schema.Types.String, ref: 'User' },
        read: {type: Schema.Types.Boolean}
    }],
    message: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
    },
    createdBy: {
        type: Schema.Types.String,
        ref: 'User'
    },
    createdDate: {
        type: Date,
        required: true
    },
});

let CommentsSchema = new Schema({
    chart: {
        type: String,
        required: true
    },
    users: [{
        id: { type: Schema.Types.String, ref: 'User' },
        read: {type: Schema.Types.Boolean}
    }],
    message: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
    },
    children: [CommentsChildrenSchema],
    createdBy: {
        type: Schema.Types.String,
        ref: 'User'
    },
    createdDate: {
        type: Date,
        required: true
    },
});

// add tags capabilities
CommentsSchema.plugin(tagsPlugin);
CommentsSchema.plugin(searchPlugin);

CommentsSchema.statics.createComment = function(input: ICommentInput): Promise < ICommentDocument > {
    const that = this;

    return new Promise < ICommentDocument > ((resolve, reject) => {

        const requiredAndNotBlank = {
            presence: {
                message: '^cannot be blank'
            }
        };

        let constraints = {
            chart: requiredAndNotBlank,
            users: requiredAndNotBlank,
            message: requiredAndNotBlank,
            createdBy: requiredAndNotBlank,
            createdDate: requiredAndNotBlank,
        };

        let errors = ( < any > validate)(( < any > input), constraints, {
            fullMessages: false
        });

        if (errors) {
            reject(errors);
            return;
        }

        that.create(input)
            .then(comment => {
                return resolve(comment);
            })
            .catch((err) => reject(err));
    });
};


CommentsSchema.statics.updateComment = function(id: string, input: ICommentInput): Promise < ICommentDocument > {
    const that = this;

    return new Promise < ICommentDocument > ((resolve, reject) => {
        that.findOneAndUpdate({ _id: id }, input)
            .exec()
            .then((comment) => resolve(comment))
            .catch((err) => reject(err));
    });
};

CommentsSchema.statics.markCommentDeleted = function(id: string): Promise < ICommentDocument > {
    const that = this;

    return new Promise < ICommentDocument > ((resolve, reject) => {
        if (!id) {
            return Promise.reject({
                message: 'There was an error updating the comment'
            });
        }

        that.findOneAndUpdate({ _id: id }, { $set: { deleted: true }})
            .exec()
            .then((comment) => resolve(comment))
            .catch((err) => reject(err));
    });
};

@injectable()
export class Comments extends ModelBase < ICommentsModel > {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Comments', CommentsSchema, 'comments');
    }
}