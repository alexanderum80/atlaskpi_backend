import { AccessLogs, IAccessLogDocument } from '../../../domain/app/access-log';
import { MutationBase } from '../../../framework/mutations';
import { AccessLogResponse } from '../access-log.types';
import { query } from '../../../framework';
import { GetAllAccessLogsActivity } from '../activities/get-all-access-logs.activity';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
@query({
    name: 'accessLogs',
    activity: GetAllAccessLogsActivity,
    parameters: [
        { name: 'filter', type: String }
    ],
    output: { type: AccessLogResponse }
})
export class GetAllAccessLogsQuery extends MutationBase<IAccessLogDocument> {
    constructor(@inject('') private _accessLogs: AccessLogs) {
        
    }

    run(data: any): Promise<IAccessLogDocument> {
        return this._accessLogs.model.getAllAccessLogs(data);
    }
}
