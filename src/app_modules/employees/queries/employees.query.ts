import { isArray } from 'util';
import { IEmployeeDocument } from '../../../domain/app/employees';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Employees } from '../../../domain';
import { Employee } from '../employees.types';
import { ListEmployeesActivity } from '../activities';

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
