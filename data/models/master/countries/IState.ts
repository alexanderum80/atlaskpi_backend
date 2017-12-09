import * as mongoose from 'mongoose';

export interface IState {
    country: string;
    name: string;
    code: string;
}

export interface IStateDocument extends IState, mongoose.Document {

}

export interface IStateModel extends mongoose.Model<IStateDocument> {

}