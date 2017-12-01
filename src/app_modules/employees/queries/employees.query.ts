import { QueryBase } from '../../query-base';
import { IQueryResponse } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IEmployeeDocument, IEmployeeModel } from '../../../models/app/employees/IEmployee';

export class EmployeesQuery extends QueryBase<IEmployeeDocument[]>{
    constructor(public identity: IIdentity,
    private _ctx: IAppModels) {
        super(identity);
    }

    run(data: any): Promise<IEmployeeDocument[]> {
        const that = this;

         return new Promise<IEmployeeDocument[]>((resolve, reject) => {
            that._ctx.EmployeeModel
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