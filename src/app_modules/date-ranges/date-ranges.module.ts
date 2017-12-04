import { GetDateRangesQuery } from './queries/get-date-ranges.query';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    queries: [
        GetDateRangesQuery
    ]
})
export class DateRangesModule extends ModuleBase { }