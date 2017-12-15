import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IAccessLogDocument } from '../../../domain/app/access-log/access-log';
import { AccessLogs } from '../../../domain/app/access-log/access-log.model';
import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { AccessLogResponse } from '../access-log.types';
import { GetAllAccessLogsActivity } from '../activities/get-all-access-logs.activity';

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
        super();
    }

    run(data: any): Promise<IAccessLogDocument> {
        return this._accessLogs.model.getAllAccessLogs(data);
    }
}
