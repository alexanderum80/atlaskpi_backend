
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Departments } from '../../../domain';
import { CreateDepartmentResponse } from '../departments.types';
import { CreateDepartmentActivity } from '../activities';

@injectable()
@mutation({
    name: 'createDepartment',
    activity: CreateDepartmentActivity,
    parameters: [
        { name: 'name', type: String, required: true },
        { name: 'manager', type: String },
    ],
    output: { type: CreateDepartmentResponse }
})
export class CreateDepartmentMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Departments') private _departments: Departments) {
        super();
    }

    run(data: { name: string, manager: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._departments.model.createNew(data.name, data.manager).then(department => {
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
                            errors: ['There was an error creating the department']
                        }
                    ]
                });
            });
        });
    }
}
