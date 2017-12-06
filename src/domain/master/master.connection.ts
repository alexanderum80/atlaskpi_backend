import { ExtendedRequest } from '../../middlewares/extended-request';
import { injectable, inject } from 'inversify';
import { DbConnection } from '../../type-mongo';

@injectable()
export class MasterConnection extends DbConnection {

    constructor(@inject('Request') req: ExtendedRequest) {
        super(req);
        this._connection = req.masterConnection;
    }

}