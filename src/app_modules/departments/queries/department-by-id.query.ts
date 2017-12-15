import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IDepartmentDocument } from '../../../domain/app/departments/department';
import { Departments } from '../../../domain/app/departments/department.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { DepartmentByIdActivity } from '../activities/department-by-id.activity';
import { Department } from '../departments.types';


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
