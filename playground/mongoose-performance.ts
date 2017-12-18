import * as path from 'path';
import * as mongoose from 'mongoose';
import { getContext } from '../data/models/app/app-context';

export function testMongoosePerformance() {

    // enable mongo debug mode
    mongoose.set('debug', true);

    getContext('mongodb://localhost/customer2').then(ctx => {
        // ctx.User
        //     .find({})
        //     .populate('roles').then(users => {
        //     console.dir(users[0].toObject());
        // });


         ctx.Dashboard
            .findOne({ _id: '59024feb4592fd3f554c2684' })
            .populate({
                path: 'charts',
                populate: { path: 'kpis' }
            })
            .then(data => {
                console.dir(data.toObject());
            });

    });

}