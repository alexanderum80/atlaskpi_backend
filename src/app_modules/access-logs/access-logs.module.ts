import { CreateAccessLogMutation } from './mutations';
import { FindAllAcessLogsQuery } from './queries';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateAccessLogMutation
    ],
    queries: [
        FindAllAcessLogsQuery
    ]
})
export class AccessLogsModule extends ModuleBase { }