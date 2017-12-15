import { CreateAccessLogMutation } from './mutations/create-access-log.mutation';
import { GetAllAccessLogsQuery } from './queries/find-all-access-logs.query';
import {
    AppModule, ModuleBase
} from '../../framework/decorators/app-module';

@AppModule({
    queries: [
        GetAllAccessLogsQuery
    ],
    mutations: [
        CreateAccessLogMutation
    ]
})
export class AccessLogsModule extends ModuleBase { }