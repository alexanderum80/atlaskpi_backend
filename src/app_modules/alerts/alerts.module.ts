import { UpdateAlertMutation } from './mutations/update-alert.mutation';
import { CreateAlertMutation } from './mutations/create-alert.mutation';
import { AlertByWidgetIdQuery } from './queries/alert-by-widget-id.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import {RemoveAlertMutation} from './mutations/remove-alert.mutation';
import {UpdateAlertActiveMutation} from './mutations/update-alert-active.mutation';

@AppModule({
    queries: [
        AlertByWidgetIdQuery
    ],
    mutations: [
        CreateAlertMutation,
        UpdateAlertMutation,
        UpdateAlertActiveMutation,
        RemoveAlertMutation
    ]
})

export class AlertsModule extends ModuleBase {}