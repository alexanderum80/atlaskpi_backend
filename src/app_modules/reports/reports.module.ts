import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { EndOfDayReportQuery } from './queries/end-of-day-report.query';

@AppModule({
    queries: [
        EndOfDayReportQuery
    ]
})
export class ReportsModule extends ModuleBase { }