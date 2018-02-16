import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

export interface IHelpCenterUser {
    username: String;
    tokens: String;
}


export interface IHelpCenterUserDocument extends IHelpCenterUser, mongoose.Document {
}


export interface IHelpCenterUserModel extends mongoose.Model<IHelpCenterUserDocument> {
    helpCenterUserById(id: string): Promise<IHelpCenterUserDocument>;
}
