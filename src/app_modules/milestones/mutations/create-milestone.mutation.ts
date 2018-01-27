import { MilestoneInput, MilestoneResponse } from '../milestone.types';
import { CreateMileStoneActivity } from '../activities/create-milestone.activity';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { Milestones } from '../../../domain/app/milestones/milestone.model';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

@injectable()
@mutation({
    name: 'createMilestone',
    activity: CreateMileStoneActivity,
    parameters: [
        {
            name: 'input', type: MilestoneInput
        }
    ],
    output: { type: MilestoneResponse }
})
export class CreateMilestoneMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Milestones.name) private _milestoneModel: Milestones
    ) {
        super();
    }
    run(data: { input: MilestoneInput} ): Promise<IMutationResponse> {
        const that = this;
        const input = data.input;
        // resolve kpis
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._milestoneModel.model.createMilestone(input.target, input.task,
                input.dueDate, input.status, input.responsible)
            .then(milestone => {
                    resolve({
                        success: true,
                        entity: milestone
                    });
            }).catch(err => {
                    resolve({
                        success: false,
                        errors: [
                            {
                                field: 'general',
                                errors: ['There was an error creating the milestone']
                            }
                        ]
                    });
            });
        });
    }
}