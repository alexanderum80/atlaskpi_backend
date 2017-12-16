import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Departments } from '../../../domain/app/departments/department.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteDepartmentActivity } from '../activities/delete-department.activity';
import { DeleteDepartmentResponse } from '../departments.types';



@injectable()
@mutation({
    name: 'deleteDepartment',
    activity: DeleteDepartmentActivity,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: DeleteDepartmentResponse }
})
export class DeleteDepartmentMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Departments.name) private _departments: Departments) {
        super();
    }

    run(data: { _id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._departments.model.deleteDepartment(data._id).then(department => {
                resolve({
                    success: department !== null,
                    errors: department !== null ? [] : [{ field: 'general', errors: ['Department not found'] }]
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error deleting the department']
                        }
                    ]
                });
            });
        });
    }
}
