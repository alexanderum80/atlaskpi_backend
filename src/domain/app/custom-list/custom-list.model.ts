import { ICustomListModel, ICustomListDocument, ICustomListResponse, ICustomList } from './custom-list';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { tagsPlugin } from '../tags/tag.plugin';

const CustomListSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dataType: String,
    listValue: [String],
    users: [String]
});

CustomListSchema.plugin(tagsPlugin);

CustomListSchema.statics.getCustomList = async function (user: string, id?: string): Promise<ICustomList[]> {
    const model = this as ICustomListModel;

    try {
        const query = id ? { _id: id, users: user } : { users: user };
        return model.find(query).lean().exec() as Promise<ICustomList[]>;
    } catch (e) {
        console.error('Error getting data type list');
        return null;
    }
};

CustomListSchema.statics.getCustomListByName = async function (user: string, name: string): Promise<ICustomList> {
    const model = this as ICustomListModel;

    try {
        const expressionName = new RegExp(name, 'i');
        const query = name ? { name: { $regex: expressionName }, users: user } : { users: user };

        return model.findOne(query).lean().exec() as Promise<ICustomList>;
    } catch (e) {
        console.error('Error getting data type list');
        return null;
    }
};

CustomListSchema.statics.addCustomList = async function(data: any): Promise<ICustomListDocument> {
    const that = this as ICustomListModel;
    if (!data) { throw new Error('cannot add a document with, empty payload'); }

    try {
        return that.create(data);
    } catch (e) {
        console.error(e);
        throw new Error('Error creating custom list: ' + e);
    }
};

CustomListSchema.statics.updateCustomList = async function(data: any): Promise<ICustomListDocument> {
    const that = this as ICustomListModel;
    if (!data) { throw new Error('cannot update a document with, empty payload'); }

    try {
        return that.findByIdAndUpdate(data._id, data).exec();
    } catch (e) {
        console.error(e);
        throw new Error('Error updating custom list: ' + e);
    }
};

CustomListSchema.statics.removeCustomList = function(id: string): Promise<ICustomListDocument> {
    const that = this as ICustomListModel;
    if (!id) { throw new Error('cannot remove a document with, empty payload'); }

    try {
        return that.findByIdAndRemove(id).exec();
    } catch (e) {
        console.error(e);
        throw new Error('Error updating custom list: ' + e);
    }
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


