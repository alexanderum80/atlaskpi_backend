import { IUserModel } from '../../../models/app/users';
import { ITargetModel } from '../../../models/app/targets/ITarget';
import { IIdentity } from '../../../models/app/identity';
import { IMutationResponse } from '../../../models/common';
import { MutationBase } from '../..';
import * as Promise from 'bluebird';

export class UpdateTargetMutation extends MutationBase<IMutationResponse> {
    constructor(public identity: IIdentity,
                private _TargetModel: ITargetModel,
                private _UserModel: IUserModel) {
                    super(identity);
                }

    run(data: any): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            let promises = [];
            let owner = that._TargetModel.findById(data.id)
                .then((target) => {
                    return target.owner;
                });
            promises.push(owner);
            Promise.all(promises)
                .then((o) => {
                    that._UserModel.findByUsername(o[0])
                        .then((response) => {
                            if (response) {
                                that._TargetModel.updateTarget(data.id, data.data)
                                    .then((theTarget) => {
                                        resolve({ success: true, entity: theTarget });
                                        return;
                                    });
                            }
                            reject({ success: false, errors: [ { field: 'target', errors: ['Not permitted to updateTarget'] } ] });
                        }).catch((err) => {
                            resolve({ success: false, errors: [ { field: 'target', errors: [err] } ]});
                    });
                }).catch((err) => {
                    resolve({ success: false, errors: [ { field: 'target', errors: [err] } ]})
                });
        });
    }
}