import { MilestoneService } from '../../../services/milestone.services';
import { Employees } from '../../../domain/app/employees/employee.model';
import { GetAllMileStonesActivity } from '../activities/get-all-milestones.activity';
import { IMilestone, IMilestoneDocument } from '../../../domain/app/milestones/milestone';
import { Users } from '../../../domain/app/security/users/user.model';
import { Milestones } from '../../../domain/app/milestones/milestone.model';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { Milestone } from '../milestone.types';
import { GetMileStoneByIdActivity } from '../activities/get-milestone-by-id.activity';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';

@injectable()
@query({
    name: 'milestonesByTarget',
    activity: GetAllMileStonesActivity,
    parameters: [
        { name: 'target', type: String },
    ],
    output: { type: Milestone, isArray: true }
})
export class MilestonesByTargetQuery implements IQuery<IMilestoneDocument[]> {
    constructor(@inject(Milestones.name) private _milestones: Milestones) { }

    async run(data: { target: string }): Promise<IMilestoneDocument[]> {
        try {
            if (!data.target) {
                return null;
            }

            return await this._milestones.model.milestonesByTarget(data.target);

        } catch (err) {
            throw new Error('error finding milestone by target');
        }
    }
}
