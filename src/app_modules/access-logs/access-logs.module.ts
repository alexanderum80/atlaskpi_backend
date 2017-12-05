import { GetAllAccessLogsQuery } from './queries';
import { CreateAccessLogMutation } from './mutations';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    queries: [
        GetAllAccessLogsQuery
    ]
})
export class AccessLogsModule extends ModuleBase { }