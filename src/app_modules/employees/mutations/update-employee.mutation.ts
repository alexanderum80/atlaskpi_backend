import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IEmployeeInput } from '../../../domain/app/employees/employee';
import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateEmployeeActivity } from '../activities/update-employee.activity';
import { EmployeeAttributesInput, UpdateEmployeeResponse } from '../employees.types';


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
    constructor(@inject(Employees.name) private _employees: Employees) {
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
