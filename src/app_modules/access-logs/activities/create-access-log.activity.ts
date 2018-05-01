import { IActivity } from '../../../framework/modules/security/activity';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class CreateAccessLogActivity implements IActivity {

    constructor() {}

    check(): Promise<boolean> {
        return Promise.resolve(true);
    }
}