import { IBusinessUnitModel } from './IBusinessUnit';
import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

const LocationSchema = new mongoose.Schema({
    externalId: String,
    name: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
});

const BusinessUnitAliasSchema = new Schema({
    source: String,
    externalId: String,
    name: String
});

let BusinessUnitSchema = new Schema({
    name: String,
    aliases: [BusinessUnitAliasSchema],
    locations: [LocationSchema]
});

// LocationSchema.methods.

// LocationSchema.statics.

export function getBusinessUnitModel(m: mongoose.Connection): IBusinessUnitModel {
    return <IBusinessUnitModel>m.model('BusinessUnit', BusinessUnitSchema, 'businessUnits');
}