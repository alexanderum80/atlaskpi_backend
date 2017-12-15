import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isArray } from 'util';

import { IEmployeeDocument } from '../../../domain/app/employees/employee';
import { Employees } from '../../../domain/app/employees/employee.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListEmployeesActivity } from '../activities/list-employees.activity';
import { Employee } from '../employees.types';

@injectable()
@query({
    name: 'employees',
    activity: ListEmployeesActivity,
    output: { type: Employee, isArray: true }
})
export class EmployeesQuery implements IQuery<IEmployeeDocument[]> {

    constructor(@inject('Employees') private _employees: Employees) { }

    run(): Promise<IEmployeeDocument[]> {
        const that = this;

        return new Promise<IEmployeeDocument[]>((resolve, reject) => {
            that._employees.model
            .find()
            .then(employeeDocuments => {
                return resolve(employeeDocuments);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }
}
