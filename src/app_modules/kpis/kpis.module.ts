import { KpiByNameQuery } from './queries/kpi-by-name.query';
import { GetKpisCriteriaQuery } from './queries/get-kpi-criteria.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateKpiMutation } from './mutations/create-kpi.mutation';
import { RemoveKpiMutation } from './mutations/remove-kpi.mutation';
import { UpdateKpiMutation } from './mutations/update-kpi.mutation';
import { GetAllKpIsQuery } from './queries/get-all-kpis.query';
import { KpiQuery } from './queries/kpi.query';
import { KpisQuery } from './queries/kpis.query';
import { ExecuteKpiQuery } from './queries/execute.kpi';
import {GetKpiFilterFields} from './queries/get-kpi-filter-fields.query';
import {GetKpiExpressionFieldsQuery} from './queries/get-kpi-expression-fields.query';
import {KpisGroupinInfoQuery} from './queries/kpis-groupings.query';

@AppModule({
    mutations: [
        CreateKpiMutation,
        RemoveKpiMutation,
        UpdateKpiMutation
    ],
    queries: [
        GetAllKpIsQuery,
        KpiQuery,
        KpisQuery,
        KpiByNameQuery,
        GetKpisCriteriaQuery,
        KpisGroupinInfoQuery,
        ExecuteKpiQuery,
        GetKpiFilterFields,
        GetKpiExpressionFieldsQuery
    ]
})
export class KpisModule extends ModuleBase { }