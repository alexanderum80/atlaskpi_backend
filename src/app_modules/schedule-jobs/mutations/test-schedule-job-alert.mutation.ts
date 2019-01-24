import { inject, injectable } from 'inversify';

import { Users } from '../../../domain/app/security/users/user.model';
import { IWidgetInput } from '../../../domain/app/widgets/widget';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ScheduleJobService } from '../../../services/schedule-jobs/schedule-job.service';
import { TestScheduleJobAlertActivity } from '../activities/test-scheduleJob-alert.activity.1';

@injectable()
@mutation({
    name: 'testScheduleJobAlert',
    activity: TestScheduleJobAlertActivity,
    parameters: [
        { name: 'deliveryMethods', type: GraphQLTypesMap.String, isArray: true, required: true },
        { name: 'users', type: GraphQLTypesMap.String, isArray: true, required: true },
    ],
    output: { type: GraphQLTypesMap.Boolean }
})
export class TestScheduleJobAlertMutation extends MutationBase<boolean> {
    constructor(
        @inject(Users.name) private _users: Users,
        @inject(ScheduleJobService.name) private _scheduleJobService: ScheduleJobService,
    ) {
        super();
    }

    async run(data: { input: IWidgetInput }): Promise<boolean> {
        return Promise.resolve(true);
    }
}
