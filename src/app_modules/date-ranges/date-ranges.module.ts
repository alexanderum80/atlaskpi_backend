import { DateRangesQuery } from './queries';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    queries: [
        DateRangesQuery
    ]
})
export class DateRangesModule extends ModuleBase { }