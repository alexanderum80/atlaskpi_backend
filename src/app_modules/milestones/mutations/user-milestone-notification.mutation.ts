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

@injectable()
@mutation({
    name: 'userMilestoneNotification',
    activity: UserMilestoneNotificationActivity,
    parameters: [
        {
            name: 'email',
            type: GraphQLTypesMap.String,
            required: true
        }
    ],
    output: {
        type: MilestoneResponse
    }
})
export class UserMilestoneMutation extends MutationBase <IMutationResponse> {
    constructor(
        @inject(Milestones.name)private _milestoneModel,
        @inject(UserMilestoneNotification.name)private _userMilestoneNotifier
        ) {
        super();
    }
    run(data): Promise <IMutationResponse> {
        const that = this;
        return new Promise <IMutationResponse> ((resolve, reject) => {
            return that
                ._milestoneModel
                .model
                .milestoneNotifier(data.email, that._userMilestoneNotifier)
                .then((sentInfo) => {
                    return resolve({success: true});
                }, (err) => {
                    return resolve({success: false});
                });
        });
    }
}
