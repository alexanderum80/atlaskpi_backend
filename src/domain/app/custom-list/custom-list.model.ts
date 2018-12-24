import { ICustomListModel, ICustomListDocument, ICustomListResponse } from './custom-list';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { tagsPlugin } from '../tags/tag.plugin';

const CustomListSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dataType: String,
    user: String,
    listValue: [String]
});

CustomListSchema.plugin(tagsPlugin);

CustomListSchema.statics.getCustomList = function (user: string, id?: string): Promise<ICustomListDocument[]> {
    const model = this as ICustomListModel;

    try {
        const query = id ? { _id: id, user: user } : { user: user };
        return new Promise<ICustomListDocument[]>((resolve, reject) => {
            return model.find(query)
                .then(res => {
                    resolve(res);
                });
        });
    } catch (e) {
        console.error('Error getting data type list');
        return null;
    }
};

CustomListSchema.statics.getCustomListByName = function (user: string, name: string): Promise<ICustomListDocument> {
    const model = this as ICustomListModel;

    try {
        const expressionName = new RegExp(name, 'i');
        const query = name ? { name: { $regex: expressionName }, user: user } : { user: user };
        return new Promise<ICustomListDocument>((resolve, reject) => {
            return model.findOne(query)
                .then(res => {
                    resolve(res);
                });
        });
    } catch (e) {
        console.error('Error getting data type list');
        return null;
    }
};

CustomListSchema.statics.addCustomList = function(data: any): Promise<ICustomListDocument> {
    const that = this;
    if (!data) { return Promise.reject('cannot add a document with, empty payload'); }

    return new Promise<ICustomListDocument>((resolve, reject) => {
        return that.create(data)
            .then(newDataType => {
                resolve(newDataType);
                return;
            })
            .catch(err => {
                reject('cannot create custom list: ' + err);
                return;
            });
    });
};

CustomListSchema.statics.updateCustomList = function(data: any): Promise<ICustomListDocument> {
    const that = this as ICustomListModel;
    if (!data) { return Promise.reject('cannot update a document with, empty payload'); }

    return new Promise<ICustomListDocument>((resolve, reject) => {
        return that.findByIdAndUpdate(data._id, data)
            .then((dataType: ICustomListDocument) => {
                resolve(dataType);
                return;
            })
            .catch(err => {
                reject('cannot update custom list: ' + err);
                return;
            });
    });
};

CustomListSchema.statics.removeCustomList = function(id: string): Promise<ICustomListDocument> {
    const that = this as ICustomListModel;
    if (!id) { return Promise.reject('cannot remove a document with, empty payload'); }
    return new Promise<ICustomListDocument>((resolve, reject) => {

        return that.findByIdAndRemove(id)
            .then((removedList: ICustomListDocument) => {
                resolve(removedList);
                return;
            })
            .catch(err => {
                reject('cannot remove custom list: ' + err);
                return;
            });
    });
};

@injectable()
export class CustomList extends ModelBase<ICustomListModel> {
    constructor(
        @inject(AppConnection.name) appConnection: AppConnection,
    ) {
        super();
        this.initializeModel(appConnection.get, 'CustomLists', CustomListSchema, 'customLists');
    }
}


