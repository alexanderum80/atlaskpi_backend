import { IEmployeeModel } from '../../../models/app/employees/IEmployee';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class DeleteEmployeeMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _EmployeeModel: IEmployeeModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._EmployeeModel.deleteEmployee(data._id).then(employee => {
                resolve({
                    success: employee !== null,
                    errors: employee !== null ? [] : [{ field: 'general', errors: ['Employee not found'] }]
                });
           }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error deleting the employee']
                        }
                    ]
                });
           });
        });
    }
}
