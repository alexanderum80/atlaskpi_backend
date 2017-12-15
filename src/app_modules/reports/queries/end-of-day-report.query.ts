import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { EndOfDayReportService, IEndOfDayReport } from '../../../services/reports/end-of-day-report.service';
import { EndOfDayReportActivity } from '../activities/emd-of-day-report.activity';
import { EndOfDayReport } from '../reports.types';


@injectable()
@query({
    name: 'departments',
    activity: EndOfDayReportActivity,
    output: { type: EndOfDayReport }
})
export class EndOfDayReportQuery implements IQuery<IEndOfDayReport> {
    constructor(@inject('EndOfDayReportService') private _endOfDayReportService: EndOfDayReportService) { }

    run(data: { id: string }): Promise<IEndOfDayReport> {
        return this._endOfDayReportService.generateReport();
    }
}
