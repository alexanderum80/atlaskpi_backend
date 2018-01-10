import { injectable } from 'inversify';
import * as mongoose from 'mongoose';

@injectable()
export class ModelBase<T> {
    protected _schema: mongoose.Schema;
    protected _model;

    protected initializeModel(connection: mongoose.Connection, modelName: string, schema: mongoose.Schema, collection: string) {
        if (!this._model) {
            this._model = connection.model(modelName, schema, collection);
        }

        return this._model;
    }

    get model(): T {
        return this._model;
    }

}

