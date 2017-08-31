import { IIdentity } from '../../../models/app/identity';
import { ITarget, ITargetDocument, ITargetModel } from '../../../models/app/targets/ITarget';
import { QueryBase } from '../..';
import * as Promise from 'bluebird';

export class FindTargetQuery extends QueryBase<ITarget> {
    constructor(public identity: IIdentity,
                private _TargetModel: ITargetModel) {
                    super(identity);
                }

    run(data: any): Promise<ITarget> {
        const that = this;
        return new Promise<ITarget>((resolve, reject) => {
            that._TargetModel.findTarget(data.id)
                .then((target) => {
                    resolve(target);
                    return;
                }).catch((err) => {
                    reject({ success: false, errors: [ {field: 'target', errors: [err] } ] });
                    return;
                });
        });
    }
}