import { UpdateAlertMutation } from './mutations/update-alert.mutation';
import { CreateAlertMutation } from './mutations/create-alert.mutation';
import { AlertByWidgetIdQuery } from './queries/alert-by-widget-id.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import {RemoveAlertMutation} from './mutations/remove-alert.mutation';

@AppModule({
    queries: [
        AlertByWidgetIdQuery
    ],
    mutations: [
        CreateAlertMutation,
        UpdateAlertMutation,
        RemoveAlertMutation
    ]
})

export class AlertsModule extends ModuleBase {}