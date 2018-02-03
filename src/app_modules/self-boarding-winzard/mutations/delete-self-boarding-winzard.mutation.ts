import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteSelfBoardingWinzardActivity } from '../activities/delete-self-boarding-winzard.activity';
import { DeleteSelfBoardingWinzardResponse  } from '../self-boarding-winzard.types';
import { SelfBoardingWinzards } from '../../../domain/app/self-boarding-winzard/self-boarding-winzard.model';


@injectable()
@mutation({
    name: 'deleteSelfBoardingWinzard',
    activity: DeleteSelfBoardingWinzardActivity ,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: DeleteSelfBoardingWinzardResponse }
})
export class DeleteSelfBoardingWinzardRateMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(SelfBoardingWinzards.name) private _selfBoardingWinzard: SelfBoardingWinzards) {
        super();
    }

    run(data: { _id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._selfBoardingWinzard.model.deleteSelfBoardingWinzard(data._id).then(selfBoardingWinzard => {
                resolve({
                    success: selfBoardingWinzard !== null,
                    errors: selfBoardingWinzard !== null ? [] : [{ field: 'general', errors: ['Status of self boarding winzard not found'] }]
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error deleting the status of self boarding winzard']
                        }
                    ]
                });
            });
        });
    }
}
