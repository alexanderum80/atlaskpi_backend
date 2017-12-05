
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Employees } from '../../../domain';
import { DeleteEmployeeResponse } from '../employees.types';
import { DeleteEmployeeActivity } from '../activities';

@injectable()
@mutation({
    name: 'deleteEmployee',
    activity: DeleteEmployeeActivity,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: DeleteEmployeeResponse }
})
export class DeleteEmployeeMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Employees') private _employees: Employees) {
        super();
    }

    run(data: { _id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._employees.model.deleteEmployee(data._id).then(employee => {
                resolve({
                    success: employee !== null,
                    errors: employee !== null ? [] : [{ field: 'general', errors: ['Employee not found'] }]
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error deleting the employee']
                        }
                    ]
                });
            });
        });
    }
}
