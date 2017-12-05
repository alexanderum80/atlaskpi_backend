import { MutationBase } from '../../../framework/mutations';
import { AccessLogs } from '../../../domain/app/access-log';
import { IMutationResponse } from '../../../framework';
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';

@injectable()
export class CreateAccessLogMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('AccessLogs') private _accessLogs: AccessLogs) {
        super();
    }

    run(data: any): Promise<IMutationResponse> {
        return this._accessLogs.model.createLog(data);
    }
}