import * as mongoose from 'mongoose';
import { injectable } from 'inversify';
import { getModelMetadata } from './';

@injectable()
export class ModelBase<T> {
    protected _schema: mongoose.Schema;

    constructor(private _connection: mongoose.Connection) {
        // implement all methods from mongoose model
        const metadata = getModelMetadata(this);
        Object.assign(this, _connection.model(metadata.name, this._schema, metadata.collection));
    }

}

