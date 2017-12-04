import { EndOfDayReportQuery } from './queries/end-of-day-report.query';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    queries: [
        EndOfDayReportQuery
    ]
})
export class ReportsModule extends ModuleBase { }