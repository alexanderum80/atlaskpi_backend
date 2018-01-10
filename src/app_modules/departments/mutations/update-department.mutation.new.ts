import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Departments } from '../../../domain/app/departments/department.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateDepartmentActivity } from '../activities/update-department.activity';
import { UpdateDepartmentResponse } from '../departments.types';

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
    constructor(@inject(Departments.name) private _departments: Departments) {
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
