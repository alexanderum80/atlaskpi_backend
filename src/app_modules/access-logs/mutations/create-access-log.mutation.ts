import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { AccessLogs } from '../../../domain/app/access-log/access-log.model';
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';

@injectable()
export class CreateAccessLogMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(AccessLogs.name) private _accessLogs: AccessLogs) {
        super();
    }

    run(data: any): Promise<IMutationResponse> {
        return this._accessLogs.model.createLog(data);
    }
}