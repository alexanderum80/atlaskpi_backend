import { YesterdaySalesQuery } from './querys/sales-by-date.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';

@AppModule({
    queries: [
        YesterdaySalesQuery
    ]
})
export class ActivitiesModule extends ModuleBase { }