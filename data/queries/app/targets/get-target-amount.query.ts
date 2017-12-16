import { IAppModels } from '../../../models/app/app-models';
import { TargetService } from '../../../services/targets/target.service';
import { IIdentity } from '../../../models/app/identity';
import { ITarget, ITargetDocument, ITargetModel } from '../../../models/app/targets/ITarget';
import { QueryBase } from '../..';
import * as Promise from 'bluebird';

export class GetTargetAmount {
    constructor(public identity: IIdentity,
                private _ctx: IAppModels) {}

    run(data: { input: any}): Promise<any> {
        const that = this;
        const targetService = new TargetService(this._ctx.User, this._ctx.Target, this._ctx.Chart);
        return new Promise<any>((resolve, reject) => {
            targetService.caculateFormat(data.input, that._ctx)
                .then(targetAmount => {
                    resolve({amount: targetAmount});
                    return;
                })
                .catch(err => {
                    reject(err);
                    return;
                });
        });
    }
}