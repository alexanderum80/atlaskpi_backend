import mongoose = require('mongoose');

import { IZipToMap, IZipToMapDocument, IZipToMapModel } from './IZipToMap';

// define mongo schema

let Schema = mongoose.Schema;

let IZipToMapSchema = new mongoose.Schema({
    zipCode: String,
    lat: Number,
    lng: Number
});

export function getZipToMapModel(): IZipToMapModel {
    return <IZipToMapModel>mongoose.model('ZipToMap', IZipToMapSchema, 'zipToMap');
}
