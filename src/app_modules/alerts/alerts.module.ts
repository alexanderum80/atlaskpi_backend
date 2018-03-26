import { UpdateAlertMutation } from './mutations/update-alert.mutation';
import { CreateAlertMutation } from './mutations/create-alert.mutation';
import { AlertByWidgetIdQuery } from './queries/alert-by-widget-id.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';

@AppModule({
    queries: [
        AlertByWidgetIdQuery
    ],
    mutations: [
        CreateAlertMutation,
        UpdateAlertMutation
    ]
})

export class AlertsModule extends ModuleBase {}