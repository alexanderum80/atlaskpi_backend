import { EndOfDayReport } from '../reports.types';
import { EndOfDayReportService, IEndOfDayReport } from '../../../services/reports/end-of-day-report.service';
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Departments, IDepartmentDocument } from '../../../domain';
import { EndOfDayReportActivity } from '../activities';

@injectable()
@query({
    name: 'departments',
    activity: EndOfDayReportActivity,
    output: { type: EndOfDayReport }
})
export class EndOfDayReportQuery implements IQuery<IEndOfDayReport> {
    constructor(@inject('EndOfDayReportService') private _endOfDayReportService: EndOfDayReportService) {
        
    }

    run(data: { id: string }): Promise<IEndOfDayReport> {
        return this._endOfDayReportService.generateReport();
    }
}
