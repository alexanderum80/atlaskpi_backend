import { IExtendedRequest } from '../../middlewares/extended-request';
import { injectable, inject } from 'inversify';
import { DbConnection } from '../../type-mongo';

@injectable()
export class MasterConnection extends DbConnection {

    constructor(@inject('Request') req: IExtendedRequest) {
        super(req);
        this._connection = req.masterConnection;
    }

}