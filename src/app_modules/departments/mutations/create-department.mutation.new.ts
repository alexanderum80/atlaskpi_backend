import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Departments } from '../../../domain/app/departments/department.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateDepartmentActivity } from '../activities/create-department.activity';
import { CreateDepartmentResponse } from '../departments.types';


@injectable()
@mutation({
    name: 'createDepartment',
    activity: CreateDepartmentActivity,
    parameters: [
        { name: 'name', type: String, required: true },
        { name: 'manager', type: String },
    ],
    output: { type: CreateDepartmentResponse }
})
export class CreateDepartmentMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Departments') private _departments: Departments) {
        super();
    }

    run(data: { name: string, manager: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._departments.model.createNew(data.name, data.manager).then(department => {
                resolve({
                    success: true,
                    entity: department
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error creating the department']
                        }
                    ]
                });
            });
        });
    }
}
