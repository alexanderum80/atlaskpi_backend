import { inject, injectable } from 'inversify';

import { IExtendedRequest } from '../../middlewares/extended-request';
import { IUserDocument } from './security/users/user';

@injectable()
export class CurrentUser {
    private _user: IUserDocument;

    constructor(@inject('Request') req: IExtendedRequest) {
        this._user = req.user;
    }

    get(): IUserDocument {
        return this._user;
    }
}