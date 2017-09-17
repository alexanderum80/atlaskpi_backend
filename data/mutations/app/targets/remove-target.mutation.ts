import { IAppModels } from '../../../models/app/app-models';
import { ITargetModel } from '../../../models/app/targets/ITarget';
import { IIdentity } from '../../../models/app/identity';
import { IMutationResponse } from '../../../models/common';
import { MutationBase } from '../..';
import * as Promise from 'bluebird';

export class RemoveTargetMutation extends MutationBase<IMutationResponse> {
    constructor(public identity: IIdentity,
                private _TargetModel: ITargetModel,
                private _ctx: IAppModels) {
                    super(identity);
                }

    run(data: any): Promise<IMutationResponse> {
        const that = this;
        let _data = data.hasOwnProperty('data') ? data.data : data;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._TargetModel.removeTarget(data.id, that.identity.username)
                .then((deletedTarget) => {
                    resolve({ success: true, entity: deletedTarget});
                    return;
                }).catch((err) => {
                    resolve({ success: false, errors: [ {field: 'target', errors: [err]} ] });
                    return;
                });
        });
    }
}