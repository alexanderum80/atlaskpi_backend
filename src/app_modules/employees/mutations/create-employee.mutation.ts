import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IEmployeeInput } from '../../../domain/app/employees/employee';
import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateEmployeeActivity } from '../activities/create-employee.activity';
import { CreateEmployeeResponse, EmployeeAttributesInput } from '../employees.types';

@injectable()
@mutation({
    name: 'createEmployee',
    activity: CreateEmployeeActivity,
    parameters: [
        { name: 'employeeAttributes', type: EmployeeAttributesInput },
    ],
    output: { type: CreateEmployeeResponse }
})
export class CreateEmployeeMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Employees.name) private _employees: Employees) {
        super();
    }

    run(data: { employeeAttributes: IEmployeeInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._employees.model.createNew(data.employeeAttributes)
            .then(employee => {
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
                            errors: ['There was an error creating the employee']
                        }
                    ]
                });
            });
        });
    }
}
