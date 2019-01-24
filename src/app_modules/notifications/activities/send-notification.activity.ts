import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { CurrentUser } from '../../../domain/app/current-user';
import { IActivity } from '../../../framework/modules/security/activity';

@injectable()
export class SendNotificationActivity implements IActivity {

    constructor(@inject(CurrentUser.name) private _user: CurrentUser) {}

    check(): Promise<boolean> {
        return Promise.resolve(true);
    }
}