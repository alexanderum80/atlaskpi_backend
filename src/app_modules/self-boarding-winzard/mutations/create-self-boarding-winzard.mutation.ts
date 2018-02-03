import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IEmployeeInput } from '../../../domain/app/employees/employee';
import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateStastusSelfBoardingWinzardActivity } from '../activities/create-status-self-boarding-winzard.activity';
import { SelfBoardingWinzardInput, CreateSelfBoardingWinzardResponse  } from '../self-boarding-winzard.types';
import { SelfBoardingWinzards } from '../../../domain/app/self-boarding-winzard/self-boarding-winzard.model';
import { ISelfBoardingWinzardDocument, ISelfBoardingWinzardInput } from '../../../domain/app/self-boarding-winzard/self-boarding-winzard';


@injectable()
@mutation({
    name: 'createSelfBoardingWinzard',
    activity: CreateStastusSelfBoardingWinzardActivity,
    parameters: [
        { name: 'selfBoardingWinzardInput', type: SelfBoardingWinzardInput },
    ],
    output: { type: CreateSelfBoardingWinzardResponse }
})
export class CreateSelfBoardingWinzardMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(SelfBoardingWinzards.name) private _selfBoardingWinzard: SelfBoardingWinzards) {
        super();
    }

    run(data: { selfBoardingWinzardInput: ISelfBoardingWinzardInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._selfBoardingWinzard.model.createNew(data.selfBoardingWinzardInput)
            .then(selfBoardingWinzard => {
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
                            errors: ['There was an error creating the status of self boarding winzards']
                        }
                    ]
                });
            });
        });
    }
}
