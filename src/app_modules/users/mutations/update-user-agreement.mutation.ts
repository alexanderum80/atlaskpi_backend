import { IUserAgreementInput, IUserDocument } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';
import { ErrorSuccessResult, UserAgreementInput } from '../users.types';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import {UpdateUserAgreementActivity} from '../activities/update-user-agreement.activity';
import {IExtendedRequest} from '../../../middlewares/extended-request';

@injectable()
@mutation({
    name: 'updateUserAgreement',
    activity: UpdateUserAgreementActivity,
    parameters: [
        { name: 'input', type: UserAgreementInput }
    ],
    output: { type: ErrorSuccessResult }
})
export class UpdateUserAgreementMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Users.name) private _user: Users,
        @inject('Request') private _request: IExtendedRequest) {
        super();
    }

    run(data: { input: IUserAgreementInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            data.input.ipAddress = that._request.connection ? that._request.connection.remoteAddress : '';
            data.input.timestamp = new Date();

            that._user.model.updateUserAgreement(data.input)
                .then((user: IUserDocument) => {
                    resolve({
                        success: true,
                        entity: user
                    });
                    return;
                }).catch(err => reject(err));
        });
    }
}