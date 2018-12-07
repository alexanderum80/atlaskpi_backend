import { inject, injectable } from 'inversify';

import { CurrentUser } from '../../../domain/app/current-user';
import { Notifications } from '../../../domain/master/notification/notification.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListNotificationsActivity } from '../activities/list-notifications.activity';
import { NotificationGql } from '../notification.types';
import { notDeepStrictEqual } from 'assert';


@injectable()
@query({
    name: 'notifications',
    activity: ListNotificationsActivity,
    output: { type: NotificationGql, isArray: true }
})
export class NotificationsQuery implements IQuery<NotificationGql[]> {
    constructor(
        @inject(Notifications.name) private _notifications: Notifications,
        @inject(CurrentUser.name) private _currentUser: CurrentUser,
    ) { }

    async run(data: { id: string }): Promise<NotificationGql[]> {
        const notifications = await this._notifications.model.find(
            { user: this._currentUser.get()._id },
        ).sort({ 'status.timestamp': -1 });

        return notifications.map(n => {
            const notif = new NotificationGql();
            notif._id = n._id;
            notif.message = n.message;
            notif.status = n.status.name,
            notif.timestamp = n.status.timestamp;
            notif.deliveryMethod = n.deliveryMethod;

            return notif;
        });
    }
}
