import { IDepartmentModel } from '../../../models/app/departments/IDepartment';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class DeleteDepartmentMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _DepartmentModel: IDepartmentModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._DepartmentModel.deleteDepartment(data._id).then(department => {
                resolve({
                    success: department !== null,
                    errors: department !== null ? [] : [{ field: 'general', errors: ['Department not found'] }]
                });
           }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error deleting the department']
                        }
                    ]
                });
           });
        });
    }
}
