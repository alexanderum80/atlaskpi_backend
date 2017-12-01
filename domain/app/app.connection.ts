import { ExtendedRequest } from '../../middlewares/extended-request';
import { injectable } from 'inversify';
import { DbConnection } from '../../type-mongo';

@injectable()
export class AppConnection extends DbConnection {

    constructor(req: ExtendedRequest) {
        super(req);
        this._connection = req.appConnection;
    }

}