import { CreateAlertMutation } from './mutations/create-alert.mutation';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { UpdateAlertMutation } from './mutations/update-alert.mutation';
import { UpdateAlertActiveMutation } from './mutations/update-alert-active.mutation';
import { RemoveAlertMutation } from './mutations/remove-alert.mutation';
import { AlertsQuery } from './queries/alerts.query';

@AppModule({
    queries: [
        AlertsQuery
    ],
    mutations: [
        CreateAlertMutation,
        UpdateAlertMutation,
        UpdateAlertActiveMutation,
        RemoveAlertMutation
    ]
})

export class AlertsModule extends ModuleBase {}