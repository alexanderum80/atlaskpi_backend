import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteEmployeeActivity } from '../activities/delete-employee.activity';
import { DeleteEmployeeResponse } from '../employees.types';


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
    constructor(@inject(Employees.name) private _employees: Employees) {
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
