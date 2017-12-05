
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Departments } from '../../../domain';
import { UpdateDepartmentResponse } from '../departments.types';
import { UpdateDepartmentActivity } from '../activities';

@injectable()
@mutation({
    name: 'updateDepartment',
    activity: UpdateDepartmentActivity,
    parameters: [
        { name: '_id', type: String, required: true },
        { name: 'name', type: String, required: true },
        { name: 'manager', type: String },
    ],
    output: { type: UpdateDepartmentResponse }
})
export class UpdateDepartmentMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Departments') private _departments: Departments) {
        super();
    }

    run(data: { _id: string, name: string, manager: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._departments.model.updateDepartment(data._id, data.name, data.manager).then(department => {
                resolve({
                    success: true,
                    entity: department
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error updating the department']
                        }
                    ]
                });
            });
        });
    }
}
