import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';

export interface IUserslog {
    timestamp: Date;
    accessBy: string;
    ipAddress: string;
    event: string;
}

export interface IUserslogDocument extends IUserslog, mongoose.Document {

}

export interface IUserslogModel extends mongoose.Model<IUserslogDocument>{
    usersLog(filter: String): Promise<IUserslogDocument[]>;
}
