import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { DeleteMileStoneActivity } from '../activities/delete-milestone.activity';
import { MilestoneResponse } from '../milestone.types';
import { CreateMileStoneActivity } from '../activities/create-milestone.activity';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { Milestones } from '../../../domain/app/milestones/milestone.model';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

@injectable()
@mutation({
    name: 'deleteMilestone',
    activity: DeleteMileStoneActivity,
    parameters: [
        { name: '_id', type: GraphQLTypesMap.String, required: true }
    ],
    output: { type: MilestoneResponse }
})
export class DeleteMilestoneMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Milestones.name) private _milestoneModel: Milestones
    ) {
        super();
    }

    run(data: { _id: string }): Promise<IMutationResponse> {
        const that = this;

        // resolve kpis
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._milestoneModel.model.deleteMilestone(data._id)
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
                                errors: ['There was an error deleting the milestone']
                            }
                        ]
                    });
            });
        });
    }
}