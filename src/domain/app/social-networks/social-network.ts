import * as mongoose from 'mongoose';

export interface ISocialNetwork {
    refId: string;
    name: string;
    date?: Date;
    source: string;
    metrics: any;
}

export interface ISocialNetworkDocument extends ISocialNetwork, mongoose.Document {
}

export interface ISocialNetworkModel extends mongoose.Model<ISocialNetworkDocument> {
}