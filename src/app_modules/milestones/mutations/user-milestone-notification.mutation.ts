import { MilestoneResponse } from '../milestone.types';
import { UserMilestoneNotificationActivity } from '../activities/user-milestone-notification.activity';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { Milestones } from '../../../domain/app/milestones/milestone.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { mutation } from '../../../framework/decorators/mutation.decorator';

@injectable()
@mutation({
    name: '',
    activity: UserMilestoneNotificationActivity,
    parameters: [
        { name: 'email', type: GraphQLTypesMap.String, required: true }
    ],
    output: { type: MilestoneResponse }
})
export class UserMilestoneMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Milestones.name) private _milestoneModel
    ) {
        super();
    }
    run(data): Promise<IMutationResponse> {
        return this._milestoneModel.model.milestoneNotifier(data.email, this._userMilestoneNotifier).then((sentInfo) => {
            return { success: true };
        }, (err) => {
            return { success: false };
        });
    }