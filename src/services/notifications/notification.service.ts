import { injectable } from 'inversify';
import { IUser } from '../../domain/app/security/users/user';
import { DeliveryMethodEnum } from '../../domain/master/notification/notification';

@injectable()
export class NotificationService {

    constructor() { }

    // TODO: Finish this implementation
    notify(users: IUser[], deliveryMethod: DeliveryMethodEnum, message: string): Promise<void> {
        return Promise.resolve();
    }

}
