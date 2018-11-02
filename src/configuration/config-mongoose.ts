import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export function configMongoose() {
    (<any>mongoose).Promise = Promise;

    // if (process.env.NODE_ENV !== 'prod') {
    //   mongoose.set('debug', true);
    // }
}