import * as mongoose from 'mongoose';
import { ExtendedRequest } from '../../middlewares/extended-request';
import { injectable, inject } from 'inversify';
import { DbConnection } from '../../type-mongo';

@injectable()
export class AppConnection extends DbConnection {

    static FromMongoDbConnection(connection: mongoose.Connection): AppConnection {
        const appConnection = new AppConnection(null);
        appConnection._connection = connection;

        return appConnection;
    }

    constructor(@inject('Request') req: ExtendedRequest) {
        super(req);
        this._connection = req.appConnection;
    }

}