import { IMutationResponse } from '../../../models/common';
import { IMutation } from '../..';
import { IRoleModel } from '../../../../lib/rbac/models';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IIdentity } from '../../..';

export class CreateRoleMutation implements IMutation<IMutationResponse> {
    constructor(public identity: IIdentity,
                private _IRoleModel: IRoleModel) { }

    run(data: any): Promise<IMutationResponse> {
        return this._IRoleModel.createRole(data.data);
    }
}