import { SalesByDateQuery } from './querys/sales-by-date.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';

@AppModule({
    queries: [
        SalesByDateQuery
    ]
})
export class ActivitiesModule extends ModuleBase { }