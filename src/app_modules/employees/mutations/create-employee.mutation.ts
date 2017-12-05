import { IEmployeeInput } from '../../../domain/app/employees';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Employees } from '../../../domain';
import { CreateEmployeeResponse, EmployeeAttributesInput } from '../employees.types';
import { CreateEmployeeActivity } from '../activities';

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
    constructor(@inject('Employees') private _employees: Employees) {
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
