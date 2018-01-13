import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IEmployeeInput } from '../../../domain/app/employees/employee';
import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateSelfBoardinWinzardActivity } from '../activities/update-self-boarding-winzard.activity';
import { SelfBoardingWinzardInput, UpdateSelfBoardingWinzardResponse } from '../self-boarding-winzard.types';
import { ISelfBoardingWinzardInput } from '../../../domain/app/self-boarding-winzard/self-boarding-winzard';
import { SelfBoardingWinzards } from '../../../domain/app/self-boarding-winzard/self-boarding-winzard.model';


@injectable()
@mutation({
    name: 'updateSelfBoardingWinzard',
    activity: UpdateSelfBoardinWinzardActivity ,
    parameters: [
        { name: '_id', type: String, required: true },
        { name: 'chartRunRateInput', type: SelfBoardingWinzardInput },
    ],
    output: { type: UpdateSelfBoardingWinzardResponse }
})
export class UpdateSelfBoardingWinzardMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(SelfBoardingWinzards.name) private _selfBoardingWinzard: SelfBoardingWinzards) {
        super();
    }

    run(data: { _id: string, SelfBoardingWinzard: ISelfBoardingWinzardInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._selfBoardingWinzard.model.updateSelfBoardingWinzard(data._id, data.SelfBoardingWinzard).then(selfBoardingWinzard => {
                resolve({
                    success: true,
                    entity: selfBoardingWinzard
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error updating the status of self boarding winzard']
                        }
                    ]
                });
            });
        });
    }
}
