import { IActivity } from '../../../framework/modules/security/activity';
import * as Promise from 'bluebird';
import { injectable } from 'inversify';

@injectable()
export class CreateMapActivity implements IActivity {

    constructor() {}

    check(): Promise<boolean> {
        return Promise.resolve(true);
    }
}