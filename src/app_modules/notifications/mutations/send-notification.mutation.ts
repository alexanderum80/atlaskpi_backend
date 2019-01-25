import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';

import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { NotificationService } from '../../../services/notifications/notification.service';
import { SendNotificationActivity } from '../activities/send-notification.activity';
import { DeliveryMethodEnum } from '../../../domain/master/notification/notification';


@injectable()
@mutation({
    name: 'sendNotification',
    activity: SendNotificationActivity,
    parameters: [
        { name: 'users', type: GraphQLTypesMap.String, isArray: true },
        { name: 'deliveryMethods', type: GraphQLTypesMap.String, isArray: true },
        { name: 'message', type: GraphQLTypesMap.String },
    ],
    output: { type: GraphQLTypesMap.Boolean }
})
export class SendNotificatonMutation extends MutationBase<boolean> {
    constructor(@inject(NotificationService.name) private notificationService: NotificationService) {
        super();
    }

    run(data: { users: string[], deliveryMethods: string[], message: string }): Bluebird<boolean> {
        return Bluebird.map(
            data.deliveryMethods,
            dm => this.notificationService.notify(data.users, dm as DeliveryMethodEnum, data.message)
        ).then(() => true);
    }
}
