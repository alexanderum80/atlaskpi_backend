import { IEmployeeModel } from '../../../models/app/employees';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class CreateEmployeeMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _EmployeeModel: IEmployeeModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._EmployeeModel.createNew(data.employeeAttributes)
           .then(employee => {
                resolve({
                    success: true,
                    entity: employee
                });
           }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error creating the employee']
                        }
                    ]
                });
           });
        });
    }
}
