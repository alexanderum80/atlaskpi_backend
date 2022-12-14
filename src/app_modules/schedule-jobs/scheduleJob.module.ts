import { UpdateScheduleJobMutation } from './mutations/update-scheduleJob.mutation';
import { CreateScheduleJobMutation } from './mutations/create-scheduleJob.mutation';
import { ScheduleJobByWidgetIdQuery } from './queries/scheduleJob-by-widget-id.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import {RemoveScheduleJobMutation} from './mutations/remove-scheduleJob.mutation';
import {UpdateScheduleJobActiveMutation} from './mutations/update-scheduleJob-active.mutation';
import { TestScheduleJobAlertMutation } from './mutations/test-schedule-job-alert.mutation';

@AppModule({
    queries: [
        ScheduleJobByWidgetIdQuery
    ],
    mutations: [
        CreateScheduleJobMutation,
        UpdateScheduleJobMutation,
        UpdateScheduleJobActiveMutation,
        RemoveScheduleJobMutation,
        TestScheduleJobAlertMutation,
    ]
})

export class ScheduleJobModule extends ModuleBase {}