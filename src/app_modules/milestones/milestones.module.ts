import { GetMilestoneByIdQuery } from './queries/get-milestone-by-id.query';
import { GetMilestonesQuery } from './queries/get-milestones.query';
import { UserMilestoneMutation } from './mutations/user-milestone-notification.mutation';
import { DeleteMilestoneMutation } from './mutations/delete-milestone.mutation';
import { UpdateMilestoneMutation } from './mutations/update-milestone.mutation';
import { CreateMilestoneMutation } from './mutations/create-milestone.mutation';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';

@AppModule({
    mutations: [
        CreateMilestoneMutation,
        UpdateMilestoneMutation,
        DeleteMilestoneMutation,
        UserMilestoneMutation
    ],
    queries: [
        GetMilestonesQuery,
        GetMilestoneByIdQuery
    ]
})

export class MilestonesModule extends ModuleBase {}