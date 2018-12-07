import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { NotificationsQuery } from './queries/notifications.query';

@AppModule({
    mutations: [
    ],
    queries: [
        NotificationsQuery
    ]
})
export class NotificationsModule extends ModuleBase { }