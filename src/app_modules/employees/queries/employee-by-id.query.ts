import { IEmployeeDocument } from '../../../domain/app/employees';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Employees } from '../../../domain';
import { Employee } from '../employees.types';
import { EmployeeByIdActivity } from '../activities';

@injectable()
@query({
    name: 'employeeById',
    activity: EmployeeByIdActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: Employee }
})
export class EmployeeByIdQuery extends QueryBase<IEmployeeDocument> {
    constructor(@inject('Employees') private _employees: Employees) {
        super();
    }

    run(data: { id: string }): Promise<IEmployeeDocument> {
        return this._employees.model.employeeById(data.id);
    }
}
