import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { AccessLogs } from '../../../domain/app/access-log/access-log.model';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';

@injectable()
export class CreateAccessLogMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('AccessLogs') private _accessLogs: AccessLogs) {
        super();
    }

    run(data: any): Promise<IMutationResponse> {
        return this._accessLogs.model.createLog(data);
    }
}