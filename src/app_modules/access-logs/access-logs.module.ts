import { GetAllAccessLogsQuery } from './queries';
import { CreateAccessLogMutation } from './mutations';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    queries: [
        GetAllAccessLogsQuery
    ],
    mutations: [
        CreateAccessLogMutation
    ]
})
export class AccessLogsModule extends ModuleBase { }