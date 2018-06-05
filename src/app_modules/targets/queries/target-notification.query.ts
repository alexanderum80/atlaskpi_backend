import { TargetService } from '../../../services/target.service';
import { NotificationInput, NotificationResponse } from '../targets.types';
import { TargetNotificationActivity } from '../activities/target-notification.activity';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { isNumber } from 'lodash';

@injectable()
@query({
    name: 'targetNotification',
    activity: TargetNotificationActivity,
    parameters: [
        { name: 'input', type: NotificationInput }
    ],
    output: { type: NotificationResponse }
})
export class TargetNotificationQuery implements IQuery<boolean> {
    constructor(
        @inject(TargetService.name) private _targetSvc: TargetService
    ) {}

    async run(data: { input: NotificationInput }): Promise<boolean> {
        try {
            const input = data.input;
            return await this._targetSvc.sendNotification(input);
        } catch (err) {
            return ({ field: 'target notification', errors: 'unable to send notifications' }) as any;
        }
    }
}