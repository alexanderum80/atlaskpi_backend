import * as mongoose from 'mongoose';
import { IUserslogModel } from './IUsers-log';
import { IUserslogDocument, IUserslog} from './IUsers-log';
import * as Promise from 'bluebird';
import * as async from 'async';
import * as logger from 'winston';


export const UserslogSchema = new mongoose.Schema({
    timestamp: Date,
    accessBy: String,
    ipAddress: String,
    event: String     
});


UserslogSchema.statics.usersLog = function(filter: String): Promise<IUserslog[]> {
    const that = <IUserslogModel> this;
    return new Promise<IUserslog[]>((resolve, reject) => {
        that.find({}).then(userslog => {
            resolve(userslog);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retriving usersLog');
        });
    });
};

export function getUsersLogModel(m: mongoose.Connection): IUserslogModel {
    return <IUserslogModel>m.model('Userslog', UserslogSchema, 'accessLog');
}