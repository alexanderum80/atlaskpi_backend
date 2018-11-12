import { SettingsOnFlyKpisQuery } from './queries/settings-on-fly-kpis.query';
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
import {KpiGroupingsQuery} from './queries/kpi-groupings.query';
import { GetKpiOldestDateQuery } from './queries/get-kpi-oldestDate.query';
import { GetKpiDataSourcesQuery } from './queries/get-kpi-datasources.query';
import { KpiSourcesMapQuery } from './queries/kpis-sourcesMaps.query';

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
        KpiSourcesMapQuery,
        KpiByNameQuery,
        GetKpisCriteriaQuery,
        SettingsOnFlyKpisQuery,
        ExecuteKpiQuery,
        GetKpiFilterFields,
        GetKpiExpressionFieldsQuery,
        KpiGroupingsQuery,
        GetKpiOldestDateQuery,
        GetKpiDataSourcesQuery
    ]
})
export class KpisModule extends ModuleBase { }