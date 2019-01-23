import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { NotificationsQuery } from './queries/notifications.query';
import { SendNotificatonMutation } from './mutations/send-notification.mutation';

@AppModule({
    mutations: [
        SendNotificatonMutation
    ],
    queries: [
        NotificationsQuery
    ]
})
export class NotificationsModule extends ModuleBase { }