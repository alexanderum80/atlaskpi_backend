import { Users } from '../../../domain/app/security/users/user.model';
import {UserMilestoneNotification} from '../../../services/notifications/users/user-milestone.notification';
import {MilestoneResponse} from '../milestone.types';
import {UserMilestoneNotificationActivity} from '../activities/user-milestone-notification.activity';
import {GraphQLTypesMap} from '../../../framework/decorators/graphql-types-map';
import {MutationBase} from '../../../framework/mutations/mutation-base';
import {IMutationResponse} from '../../../framework/mutations/mutation-response';
import {Milestones} from '../../../domain/app/milestones/milestone.model';
import * as Promise from 'bluebird';
import {inject, injectable} from 'inversify';
import {mutation} from '../../../framework/decorators/mutation.decorator';
import { MilestoneNotificationInput } from '../milestone.types';

@injectable()
@mutation({
    name: 'userMilestoneNotification',
    activity: UserMilestoneNotificationActivity,
    parameters: [
        { name: 'input', type: MilestoneNotificationInput }
    ],
    output: {
        type: MilestoneResponse
    }
})
export class UserMilestoneMutation extends MutationBase <IMutationResponse> {
    constructor(
        @inject(Milestones.name) private _milestoneModel: Milestones,
        @inject(UserMilestoneNotification.name) private _userMilestoneNotifier: UserMilestoneNotification,
        @inject(Users.name) private _userModel: Users
        ) {
        super();
    }
    run(data: { input: MilestoneNotificationInput }): Promise <IMutationResponse> {
        const that = this;
        const input = data.input;

        return new Promise <IMutationResponse> ((resolve, reject) => {
            return that
                ._milestoneModel
                .model
                .milestoneNotifier(input, that._userModel.model, that._userMilestoneNotifier)
                .then((sentInfo) => {
                    return resolve({success: true});
                }, (err) => {
                    return resolve({success: false});
                });
        });
    }
}
