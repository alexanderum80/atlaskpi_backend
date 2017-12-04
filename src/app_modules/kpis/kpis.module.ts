import { GetKpisQuery } from './queries/get-kpis.query';
import { GetAllKPIsQuery, GetKpiQuery } from './queries';
import { CreateKPIMutation, RemoveKPIMutation, UpdateKPIMutation } from './mutations';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateKPIMutation,
        RemoveKPIMutation,
        UpdateKPIMutation
    ],
    queries: [
        GetAllKPIsQuery,
        GetKpiQuery,
        GetKpisQuery
    ]
})
export class KpisModule extends ModuleBase { }