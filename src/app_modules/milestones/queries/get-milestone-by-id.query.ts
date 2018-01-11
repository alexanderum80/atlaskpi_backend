import { IMilestoneDocument } from '../../../domain/app/milestones/milestone';
import { Milestones } from '../../../domain/app/milestones/milestone.model';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { Milestone } from '../milestone.types';
import { GetMileStoneByIdActivity } from '../activities/get-milestone-by-id.activity';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';

@query({
    name: 'milestoneById',
    activity: GetMileStoneByIdActivity,
    parameters: [
        { name: 'id', type: GraphQLTypesMap.String }
    ],
    output: { type: Milestone }
})
export class GetMilestoneByIdQuery implements IQuery<IMilestoneDocument> {

    constructor(
        @inject(Milestones.name) private _milestoneModel
    ) {}

    run(data: { id: string}): Promise<IMilestoneDocument> {
        const that = this;

        // // lets prepare the query for the dashboards
        // let query = { };
        // const user = this._usersModel.model;

        // if (user.roles.find(r => r.name === 'owner')) {
        //     query = { _id: data.id };
        // } else {
        //     query = { _id: data.id, $or: [ { owner: user._id }, { users: { $in: [user._id]} } ]};
        // }

        return new Promise<IMilestoneDocument>((resolve, reject) => {
            that._milestoneModel.model
                .findOne(query)
                .populate({
                    path: 'responsible',
                })
                .then(milestone => {
                    resolve(milestone);
                }).catch(e => {
                    reject(e);
                });
        });
    }

}