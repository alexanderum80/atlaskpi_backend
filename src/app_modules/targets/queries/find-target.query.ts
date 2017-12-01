import { IIdentity } from '../../../models/app/identity';
import { ITarget, ITargetDocument, ITargetModel } from '../../../models/app/targets/ITarget';
import { QueryBase } from '../..';
import * as Promise from 'bluebird';

export class FindTargetQuery extends QueryBase<ITargetDocument> {
    constructor(public identity: IIdentity,
                private _TargetModel: ITargetModel) {
                    super(identity);
                }

    run(data: any): Promise<ITargetDocument> {
        const that = this;

        return new Promise<ITargetDocument>((resolve, reject) => {
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