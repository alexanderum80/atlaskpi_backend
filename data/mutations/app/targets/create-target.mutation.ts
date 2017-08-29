import { IRoleModel } from '../../../models/app/targets/ITarget';
import { IIdentity } from '../../../models/app/identity';
import { IMutationResponse } from '../../../models/common/mutation-response';
import { MutationBase } from '../../mutation-base';
import * as Promise from 'bluebird';


export class CreateTargetMutation extends MutationBase<IMutationResponse> {
    constructor(public identity: IIdentity,
                private _RoleModel: IRoleModel) {
                    super(identity);
                }
    run(data: any): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._RoleModel.createTarget(data)
                .then((role) => {
                    resolve({ entity: role, success: true });
                    return;
                }).catch((err) => {
                    return resolve({ success: false, errors: [ {field: 'target', errors: [err]} ] });
                });
        });
    }
}