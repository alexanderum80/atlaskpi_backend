import { Request } from 'express';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

// this class needs to be register as singleton (it should only exist a single connection per request)

@injectable()
export abstract class DbConnection {
    protected _connection: mongoose.Connection;

    constructor(@inject('Request') private _req: Request) { }

    get get(): mongoose.Connection {
        return this._connection;
    }
}
