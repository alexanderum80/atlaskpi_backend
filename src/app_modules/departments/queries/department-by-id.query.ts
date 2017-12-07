
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Departments, IDepartmentDocument } from '../../../domain';
import { Department } from '../departments.types';
import { DepartmentByIdActivity } from '../activities';

@injectable()
@query({
    name: 'departmentById',
    activity: DepartmentByIdActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: Department }
})
export class DepartmentByIdQuery implements IQuery<IDepartmentDocument> {
    constructor(@inject('Departments') private _departments: Departments) {
        
    }

    run(data: { id: string }): Promise<IDepartmentDocument> {
        return this._departments.model.departmentById(data.id);
    }
}
