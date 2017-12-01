import * as mongoose from 'mongoose';
import { injectable } from 'inversify';
import { getModelMetadata, DbConnection } from './';

@injectable()
export class ModelBase<T> {
    protected _schema: mongoose.Schema;

    constructor(protected _connection: DbConnection,
        protected modelName: string,
        protected schema: mongoose.Schema,
        protected collection: string) {
        // implement all methods from mongoose model
        // const metadata = getModelMetadata(this);
        // Object.assign(this, _connection.model(metadata.name, this._schema, metadata.collection));
    }

    get model(): T {
        return this._connection.get.model(this.modelName, this.schema, this.collection) as any;
    }

}

