import { IEmployeeInput } from '../../../domain/app/employees';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Employees } from '../../../domain';
import { UpdateEmployeeResponse, EmployeeAttributesInput } from '../employees.types';
import { UpdateEmployeeActivity } from '../activities';

@injectable()
@mutation({
    name: 'updateEmployee',
    activity: UpdateEmployeeActivity,
    parameters: [
        { name: '_id', type: String, required: true },
        { name: 'employeeAttributes', type: EmployeeAttributesInput },
    ],
    output: { type: UpdateEmployeeResponse }
})
export class UpdateEmployeeMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Employees') private _employees: Employees) {
        super();
    }

    run(data: { _id: string, employeeAttributes: IEmployeeInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._employees.model.updateEmployee(data._id, data.employeeAttributes).then(employee => {
                resolve({
                    success: true,
                    entity: employee
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error updating the employee']
                        }
                    ]
                });
            });
        });
    }
}
