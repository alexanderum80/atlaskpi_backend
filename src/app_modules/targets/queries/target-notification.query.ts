import { PnsService } from '../../../services/pns.service';
import { TargetNotification } from '../../../services/notifications/users/target.notification';
import { IUserDocument } from '../../../domain/app/security/users/user';
import { IChartDocument } from '../../../domain/app/charts/chart';
import { Users } from '../../../domain/app/security/users/user.model';
import { Charts } from '../../../domain/app/charts/chart.model';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { NotificationInput, NotificationResponse } from '../targets.types';
import { TargetNotificationActivity } from '../activities/target-notification.activity';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';

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
        @inject(Charts.name) private _chart: Charts,
        @inject(Dashboards.name) private _dashboard: Dashboards,
        @inject(Users.name) private _user: Users,
        @inject(TargetNotification.name) private _targetNotification: TargetNotification,
        @inject(PnsService.name) private _pnsService: PnsService
    ) {}

    run(data: { input: NotificationInput }): Promise<boolean> {
        const that = this;

        return new Promise<boolean>((resolve, reject) => {
            const that = this;
            const input = data.input;

            const chartQuery = that._chart.model.findById(input.chartId);
            const dashboardQuery = that._dashboard.model.findDashboardByChartId(input.chartId);
            const userQuery = that._user.model.findUsersById(input.usersId);

            Promise.all([chartQuery, dashboardQuery, userQuery])
                .spread(( chart: IChartDocument, dashboard: string, users: IUserDocument[]) => {
                    // pass data to the notification
                    if (!chart || !dashboard || !users) {
                        reject({ field: 'target notification', errors: 'inefficient data'});
                    }
                    const notifyData = {
                        targetName: input.targetName,
                        targetAmount: input.targetAmount.toFixed(2),
                        targetDate: input.targetDate,
                        dashboardName: dashboard,
                        chartName: chart.title,
                        businessUnitName: input.businessUnit
                    };

                    const message = `Name: ${input.targetName}, amount: ${input.targetAmount}, date: ${input.targetDate}, chart: ${chart.title}`;
                    this._pnsService.sendNotifications(users, message);

                    users.forEach(user => that._targetNotification.notify(user, user.username, notifyData));
                    resolve(true);
                    return;
                });
        });
    }
}