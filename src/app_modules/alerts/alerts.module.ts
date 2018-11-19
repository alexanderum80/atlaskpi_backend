import { CreateAlertMutation } from './mutations/create-alert.mutation';
import { AlertByKpiIdQuery } from './queries/alert-by-kpi-id.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { UpdateAlertMutation } from './mutations/update-alert.mutation';
import { UpdateAlertActiveMutation } from './mutations/update-alert-active.mutation';
import { RemoveAlertMutation } from './mutations/remove-alert.mutation';

@AppModule({
    queries: [
        AlertByKpiIdQuery
    ],
    mutations: [
        CreateAlertMutation,
        UpdateAlertMutation,
        UpdateAlertActiveMutation,
        RemoveAlertMutation
    ]
})

export class AlertsModule extends ModuleBase {}