import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Users } from '../../../domain/app/security/users/user.model';
import { IActivity } from '../../../framework/modules/security/activity';

@injectable()
export class CheckIsDemoAccountActivity implements IActivity {

    constructor() {}

    check(): Promise<boolean> {
        return Promise.resolve(true);
    }
}