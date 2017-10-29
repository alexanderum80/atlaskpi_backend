import { IDepartmentModel } from '../../../models/app/departments/IDepartment';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class UpdateDepartmentMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _DepartmentModel: IDepartmentModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._DepartmentModel.updateDepartment(data._id, data.name, data.manager).then(department => {
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
                            errors: ['There was an error updating the department']
                        }
                    ]
                });
           });
        });
    }
}
