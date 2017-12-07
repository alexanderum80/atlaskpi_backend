import * as mongoose from 'mongoose';
import { IExtendedRequest } from '../../middlewares/extended-request';
import { injectable, inject } from 'inversify';
import { DbConnection } from '../../type-mongo';

@injectable()
export class AppConnection extends DbConnection {

    static FromMongoDbConnection(connection: mongoose.Connection): AppConnection {
        const appConnection = new AppConnection(null);
        appConnection._connection = connection;

        return appConnection;
    }

    constructor(@inject('Request') req: IExtendedRequest) {
        super(req);
        this._connection = req.appConnection;
    }

}