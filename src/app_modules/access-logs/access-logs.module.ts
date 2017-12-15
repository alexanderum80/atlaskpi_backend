import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { GetAllAccessLogsQuery } from './queries/find-all-access-logs.query';


@AppModule({
    queries: [
        GetAllAccessLogsQuery
    ]
})
export class AccessLogsModule extends ModuleBase { }