import { inject, injectable } from 'inversify';

import { IExtendedRequest } from '../../middlewares/extended-request';
import { DbConnection } from '../../type-mongo/connection';

@injectable()
export class MasterConnection extends DbConnection {

    constructor(@inject('Request') req: IExtendedRequest) {
        super(req);
        this._connection = req.masterConnection;
    }

}