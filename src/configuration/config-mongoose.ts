import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export function configMongoose() {
    (<any>mongoose).Promise = Promise;

    // if (process.env.NODE_ENV !== 'prod') {
        mongoose.set('debug', true);
    // }

    // mongoose.set('debug', (coll, method, query, doc) => {
    //     // console.log(query);
    //     console.log(`db.${coll}.${method}(${JSON.stringify(query)}, ${JSON.stringify(doc)})`);
    // });
}