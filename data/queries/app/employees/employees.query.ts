import { IQueryResponse } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IEmployeeDocument, IEmployeeModel } from '../../../models/app/employees/IEmployee';

export class EmployeesQuery {
    constructor(public identity: IIdentity, private _IEmployeeModel: IEmployeeModel) {}

    run(data: any): Promise<IEmployeeDocument[]> {
        return this._IEmployeeModel.employees();
    }
}