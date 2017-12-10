import { IMutationResponse } from '../../common';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IZipToMap {
    zipCode: string;
    lat: number;
    lng: number;
}

export interface IZipToMapDocument extends IZipToMap, mongoose.Document {
}

export interface IZipToMapModel extends mongoose.Model<IZipToMapDocument> {

}
