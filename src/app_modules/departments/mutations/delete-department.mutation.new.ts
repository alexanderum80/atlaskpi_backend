import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Departments } from '../../../domain';
import { IMutationResponse, mutation, MutationBase } from '../../../framework';
import { DeleteDepartmentActivity } from '../activities';
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
    constructor(@inject('Departments') private _departments: Departments) {
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
