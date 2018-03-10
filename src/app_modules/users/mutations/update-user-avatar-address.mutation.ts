import { Users } from '../../../domain/app/security/users/user.model';
import { ITourInput, ErrorSuccessResult, EditUserProfileResponse } from '../users.types';
import { injectable, inject } from 'inversify';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import * as Promise from 'bluebird';
import { UpdateUserAvatarAddressActivity } from '../activities/update-user-avatar-address.activity';

@injectable()
@mutation({
    name: 'updateUserAvatarAddress',
    activity: UpdateUserAvatarAddressActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'avatarAddrees',  type: String, required: true }
    ],
    output: { type: EditUserProfileResponse }
})
export class UpdateUserAvatarAddreesMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Users.name) private _userProfile: Users
    ) {
        super();
    }

     run(data: { id: string, avatarAddrees: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._userProfile.model.updateUserAvatarAddress(data.id, data.avatarAddrees).then((result) => {
                resolve({
                     success: true,
                    entity: result.entity
                });
            })
            .catch(err => reject(err));
        });
    }
}
