import * as Promise from 'bluebird';
import { injectable } from 'inversify';

import { IActivity } from '../../../framework/modules/security/activity';

@injectable()
export class AccountNameAvailableActivity implements IActivity {

    constructor() {}

    check(): Promise<boolean> {
        return Promise.resolve(true);
    }
}