import { Users } from '../../../domain/app/security/users/user.model';
import { input } from '../../../framework/decorators/input.decorator';
import { UserService } from '../../../services/user.service';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { EditUserProfileActivity } from '../activities/edit-user-profile.activity';
import { User, UserProfileInput, EditUserProfileResponse } from '../users.types';

@injectable()
@mutation({
    name: 'editUserProfile',
    activity: EditUserProfileActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: UserProfileInput },
    ],
    output: { type: EditUserProfileResponse }
})
export class EditUserProfileMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Users.name) private _userProfile: Users
    ) {
        super();
    }

     run(data: { id: string, input: UserProfileInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._userProfile.model.editUserProfile(data.id, data.input).then((result) => {
                resolve({
                     success: true,
                    entity: result.entity
                });
            })
            .catch(err => reject(err));
        });
    }
}
