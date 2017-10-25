import { IEmployeeModel } from '../../../models/app/employees/IEmployee';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class UpdateEmployeeMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _EmployeeModel: IEmployeeModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._EmployeeModel.updateEmployee(data._id, data.firstName, data.middleName, data.lastname, 
            data.email, data.primaryNumber, data.dob, data.nationality, data.maritalStatus, 
            data.address, data.employmentInfo).then(employee => {
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
                            errors: ['There was an error updating the employee']
                        }
                    ]
                });
           });
        });
    }
}
