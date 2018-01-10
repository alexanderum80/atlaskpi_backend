import { injectable, inject } from 'inversify';
import { IExtendedRequest } from '../../middlewares/extended-request';
import { IAccountDocument } from './accounts/Account';

@injectable()
export class CurrentAccount {
    private _account: IAccountDocument;

    constructor(@inject('Request') _request: IExtendedRequest) {
        this._account = _request.account;
    }

    get get(): IAccountDocument {
        return this._account;
    }
}