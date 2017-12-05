import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Departments, IDepartmentDocument } from '../../../domain';
import { Department } from '../departments.types';
import { DepartmentByIdActivity } from '../activities';

@injectable()
@query({
    name: 'departments',
    activity: DepartmentByIdActivity,
    output: { type: Department }
})
export class DepartmentsQuery extends QueryBase<IDepartmentDocument[]> {
    constructor(@inject('Departments') private _departments: Departments) {
        super();
    }

    run(data: { id: string }): Promise<IDepartmentDocument[]> {
        return this._departments.model.departments();
    }
}
