import { CurrentUser } from '../../../domain/app/current-user';
import { IActivity } from '../../../framework/modules/security/activity';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class UpdateUserAgreementActivity implements IActivity {

    constructor(@inject(CurrentUser.name) private _currentUser: CurrentUser) {}

    check(): Promise<boolean> {
        return Promise.resolve(true);
    }
}