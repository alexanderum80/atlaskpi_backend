import { EndOfDayReportQuery } from './queries';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    queries: [
        EndOfDayReportQuery
    ]
})
export class ReportsModule extends ModuleBase { }