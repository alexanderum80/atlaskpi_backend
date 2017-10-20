import { EndOfDayReportService, IEndOfDayReport } from '../../../services/reports/end-of-day-report.service';
import { IIdentity } from '../../../models/app/identity';
import { QueryBase } from '../../query-base';
import * as Promise from 'bluebird';

export class GetEndOfDayReportQuery extends QueryBase<IEndOfDayReport> {

    constructor(public identity: IIdentity, private _endOfDayReportService: EndOfDayReportService) {
        super(identity);
    }

    // log = true;
    // audit = true;

    run(data: any): Promise<IEndOfDayReport> {
        return this._endOfDayReportService.generateReport();
    }
}
