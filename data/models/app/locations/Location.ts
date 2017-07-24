import { ILocationModel } from './ILocation';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { Address } from '../../common';

let Schema = mongoose.Schema;

const LocationAlias = {
    source: String,
    externalId: String,
    name: String
};

let LocationSchema = new Schema({
    name: String,
    address: new Schema(Address),
    aliases: new Schema(LocationAlias)
});

// LocationSchema.methods.

// LocationSchema.statics.

export function getLocationModel(m: mongoose.Connection): ILocationModel {
    return <ILocationModel>m.model('Location', LocationSchema, 'locations');
}