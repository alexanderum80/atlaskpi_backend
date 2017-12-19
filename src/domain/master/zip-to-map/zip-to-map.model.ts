import { inject, injectable } from 'inversify';
import mongoose = require('mongoose');

import { ModelBase } from '../../../type-mongo/model-base';
import { IIndustryModel } from '../industries/Industry';
import { MasterConnection } from '../master.connection';
import { IZipToMapModel } from './zip-to-map';

// define mongo schema

let Schema = mongoose.Schema;

let IZipToMapSchema = new mongoose.Schema({
    zipCode: String,
    lat: Number,
    lng: Number
});


@injectable()
export class ZipsToMap extends ModelBase<IZipToMapModel> {
    constructor(@inject(MasterConnection.name) appConnection: MasterConnection) {
        super();
        this.initializeModel(appConnection.get, 'ZipToMap', IZipToMapSchema, 'zipToMap');
    }
}
