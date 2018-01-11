import { UpdateMileStoneActivity } from '../activities/update-milestone.activity';
import { MilestoneInput, MilestoneResponse } from '../milestone.types';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { Milestones } from '../../../domain/app/milestones/milestone.model';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

@injectable()
@mutation({
    name: 'updateMilestone',
    activity: UpdateMileStoneActivity,
    parameters: [
        { name: '_id', type: GraphQLTypesMap.String, required: true},
        { name: 'input', type: MilestoneInput }
    ],
    output: { type: MilestoneResponse}
})
export class UpdateMilestoneMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Milestones.name) private _milestoneModel
    ) {
        super();
    }
    run(data: { _id: string, input: MilestoneInput} ): Promise<IMutationResponse> {
        const that = this;
        const input = data.input;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._milestoneModel.updateMilestone(data._id, input.target, input.task,
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
                            errors: ['There was an error updating the milestone']
                        }
                    ]
                });
           });
        });
    }
}