import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { DateRangesQuery } from './queries/date-ranges.query';


@AppModule({
    queries: [
        DateRangesQuery
    ]
})
export class DateRangesModule extends ModuleBase { }