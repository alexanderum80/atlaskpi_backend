import { Users } from '../../../domain/app/security/users/user.model';
import { ITourInput, ErrorSuccessResult } from '../users.types';
import { UpdateUserPreferenceActivity } from '../activities/update-user-preference.activity';
import { injectable, inject } from 'inversify';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import * as Promise from 'bluebird';

@injectable()
@mutation({
    name: 'updateUserPreference',
    activity: UpdateUserPreferenceActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: ITourInput }
    ],
    output: { type: ErrorSuccessResult }
})
export class UpdateUserPreferenceMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Users.name) private _user: Users) {
        super();
    }

    run(data: { id: string, input: ITourInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!data || !data.input) {
                reject('No data provided to update preference');
                return;
            }

            const input = data.input;

            if (!data.id) {
                reject('No id was provided');
                return;
            }
            // update the user preference
            that._user.model.updateUserPreference(data.id, data.input).then(user => {
                resolve({ success: true, entity: user });
                return;
            }).catch(err => {
                reject({ success: false, errors: [ { field: 'user', errors: err } ] });
                return;
            });
        });
    }
}