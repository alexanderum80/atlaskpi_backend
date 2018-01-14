import { MilestoneService } from '../../../services/milestone.services';
import { Employees } from '../../../domain/app/employees/employee.model';
import { GetAllMileStonesActivity } from '../activities/get-all-milestones.activity';
import { IMilestone, IMilestoneDocument } from '../../../domain/app/milestones/milestone';
import { Users } from '../../../domain/app/security/users/user.model';
import { Milestones } from '../../../domain/app/milestones/milestone.model';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { Milestone } from '../milestone.types';
import { GetMileStoneByIdActivity } from '../activities/get-milestone-by-id.activity';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';

@injectable()
@query({
    name: 'milestonesByTarget',
    activity: GetAllMileStonesActivity,
    parameters: [
        { name: 'target', type: GraphQLTypesMap.String }
    ],
    output: { type: Milestone, isArray: true}
})
export class GetMilestonesQuery implements IQuery<IMilestone[]> {
    constructor(
        @inject(Milestones.name) private _milestoneModel,
        @inject(Employees.name) private _employeeModel,
        @inject(MilestoneService.name) private _milestoneService: MilestoneService
    ) {}

    run(data: { target: string} ): Promise<IMilestone[]> {
        const that = this;
        // // lets prepare the query for the milestones
        // let query = { };
        // if (this._user.roles.find(r => r.name === 'owner')) {
        //     query = { target: data.target };
        // } else {
        //     query = { target: data.target, $or: [ { owner: that._user._id }, { users: { $in: [that._user._id]} } ]};
        // }

        return new Promise<IMilestone[]>((resolve, reject) => {
            that._milestoneModel.model
                .find({ target: data.target })
                .populate({
                    path: 'responsible'
                })
                .then(milestones => {
                    that._milestoneService.checkPastDate(milestones).then(currentMilestones => {
                        resolve(currentMilestones);
                        return;
                    }).catch(err => {
                        reject(err);
                        return;
                    });
                }).catch(e => {
                    reject(e);
                });
        });
    }
}