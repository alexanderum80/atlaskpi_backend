import { ILocationModel } from './ILocation';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { Address } from '../../common';

let Schema = mongoose.Schema;

let LocationSchema = new Schema({
    name: String,
    address: Address,
});

// LocationSchema.methods.

// LocationSchema.statics.

export function getLocationModel(m: mongoose.Connection): ILocationModel {
    return <ILocationModel>m.model('Location', LocationSchema, 'locations');
}