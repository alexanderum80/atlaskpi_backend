import { UserMilestoneMutation } from './mutations/user-milestone-notification.mutation';
import { UpdateMilestoneStatusMutation } from './mutations/update-milestone-status.mutation';
import { DeleteMilestoneMutation } from './mutations/delete-milestone.mutation';
import { UpdateMilestoneMutation } from './mutations/update-milestone.mutation';
import { CreateMilestoneMutation } from './mutations/create-milestone.mutation';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';

@AppModule({
    mutations: [
        CreateMilestoneMutation,
        UpdateMilestoneMutation,
        UpdateMilestoneStatusMutation,
        DeleteMilestoneMutation,
        UserMilestoneMutation
    ],
    queries: [

    ]
})

export class MilestonesModule extends ModuleBase {}