import { injectable, inject } from 'inversify';
import { IUser } from '../../domain/app/security/users/user';
import { DeliveryMethodEnum } from '../../domain/master/notification/notification';
import { Users } from '../../domain/app/security/users/user.model';
import { sendEmail } from '../email/email.service';
import { PushNotifier } from './push-notifier.service';
import { flatMap } from 'lodash';

export interface IMessageTarget {
    appId: string;
    token: string;
}

export interface IPnsMessagePayload {
    appTokens: IMessageTarget[];
    message: string;
    payload?: string;
}

@injectable()
export class NotificationService {

    constructor(
        @inject(Users.name) private users: Users,
        @inject(PushNotifier.name) private pushNotifier: PushNotifier,
    ) { }

    // TODO: Finish this implementation
    async notify(userIds: string[], deliveryMethod: DeliveryMethodEnum, message: string): Promise<boolean> {
        if (!userIds || !userIds.length || !deliveryMethod || !message) {
            return false;
        }

        const users = await this.users.model.find({ _id: { $in: userIds } }).lean().exec() as IUser[];

        switch (deliveryMethod) {
            case DeliveryMethodEnum.email:
                return this.notifyViaEmail(users, message);
            case DeliveryMethodEnum.push:
                return this.notifyViaPush(users, message);
            default:
                return false;
        }
    }

    private async notifyViaEmail(users: IUser[], message: string): Promise<boolean> {
        // const res = await sendEmail(['orlando@atlaskpi.com'], 'AtlasKPI Notification', message);
        const res = await sendEmail(users.map(u => u.username), 'AtlasKPI Notification', message);
        return res. accepted.length > 0;
    }

    private async notifyViaPush(users: IUser[], message: string): Promise<boolean> {
        // const mobileInfo = [{
        //     mobileDevices: {
        //         token : 'F13510E1F1C5A9546C5BE629F3EB7283E40F2E425442C6566BCC64EC15299A31',
        //         network : 'Apple',
        //         name : 'Genesis iPhone'
        //     }
        // }];
        const mobileInfo = flatMap(users, u => u.mobileDevices);
        const res = await this.pushNotifier.notify(mobileInfo, message);

        return !!res;
    }

}
