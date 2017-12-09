import { IStateModel } from './';
import * as mongoose from 'mongoose';


const stateSchema = new mongoose.Schema({
    _id: String,
    country: String,
    name: String,
    code: String
});


export function getStateModel(): IStateModel {
    return <IStateModel>mongoose.model('State', stateSchema, 'states');
}