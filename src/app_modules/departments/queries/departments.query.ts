import { IQueryResponse } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IDepartmentDocument, IDepartmentModel } from '../../../models/app/departments/IDepartment';

export class DepartmentsQuery {
    constructor(public identity: IIdentity, private _IDepartmentModel: IDepartmentModel) {}

    run(data: any): Promise<IDepartmentDocument[]> {
        return this._IDepartmentModel.departments();
    }
}