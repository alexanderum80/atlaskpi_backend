import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';


export interface IHelpCenter {
    name: string;
    duration: number;
    url: string;
}


export interface IHelpCenterDocument extends IHelpCenter, mongoose.Document {}

export interface IHelpCenterModel extends mongoose.Model<IHelpCenterDocument> {
    helpVideos(): Promise<IHelpCenterDocument[]>;
}