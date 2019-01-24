import * as mongoose from 'mongoose';
import { IErrorDetails } from '../../common/error-details';

export interface ICustomList {
    name: string;
    dataType: string;
    users: string[];
    listValue: string[];
}

export class ICustomListInput {
    name: string;
    dataType: string;
    listValue: string[];
}

export class ICustomListResponse {
    _id: string;
    name: string;
    dataType: string;
    users: string[];
    listValue: string[];
}

export interface ICustomListDocument extends ICustomList, mongoose.Document {
}

export interface ICustomListModel extends mongoose.Model<ICustomListDocument> {
    getCustomList(user: string, id?: string): Promise<ICustomListDocument[]>;
    getCustomListByName(user: string, name: string): Promise<ICustomListDocument>;
    addCustomList(data: ICustomListInput): Promise<ICustomListDocument>;
    updateCustomList(data: ICustomListInput): Promise<ICustomListDocument>;
    removeCustomList(id: string): Promise<ICustomListDocument>;
}
