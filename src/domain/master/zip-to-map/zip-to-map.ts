import * as mongoose from 'mongoose';

export interface IZipToMap {
    zipCode: string;
    lat: number;
    lng: number;
}

export interface IZipToMapDocument extends IZipToMap, mongoose.Document {
}

export interface IZipToMapModel extends mongoose.Model<IZipToMapDocument> {

}
