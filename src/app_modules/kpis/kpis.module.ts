import {
    CreateKpiMutation,
    RemoveKpiMutation,
    UpdateKpiMutation
} from './mutations';
import {
    GetAllKpIsQuery,
    KpiQuery,
    KpisQuery
} from './queries';

import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateKpiMutation,
        RemoveKpiMutation,
        UpdateKpiMutation
    ],
    queries: [
        GetAllKpIsQuery,
        KpiQuery,
        KpisQuery
    ]
})
export class KpisModule extends ModuleBase { }