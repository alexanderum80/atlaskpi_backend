import { Employee } from '../employees.types';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IEmployeeDocument } from '../../../domain/app/employees/employee';
import { Employees } from '../../../domain/app/employees/employee.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { EmployeeByIdActivity } from '../activities/employee-by-id.activity';


@injectable()
@query({
    name: 'employeeById',
    activity: EmployeeByIdActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: Employee }
})
export class EmployeeByIdQuery implements IQuery<IEmployeeDocument> {
    constructor(@inject(Employees.name) private _employees: Employees) { }

    run(data: { id: string }): Promise<IEmployeeDocument> {
        return this._employees.model.employeeById(data.id);
    }
}
