import { IAppModels } from '../../../models/app/app-models';
import { KpiFactory } from '../../../queries/app/kpis';
import { IDateRange } from '../../../models/common';
import { parsePredifinedDate } from '../../../models/common';
import { IUserModel } from '../../../models/app/users';
import { ITargetModel } from '../../../models/app/targets/ITarget';
import { IIdentity } from '../../../models/app/identity';
import { IMutationResponse } from '../../../models/common';
import { MutationBase } from '../..';
import * as Promise from 'bluebird';
import { TargetService } from '../../../services/targets/target.service';

export class UpdateTargetMutation extends MutationBase<IMutationResponse> {

    chartInfo: any;
    isStacked: any;

    constructor(public identity: IIdentity,
                private _TargetModel: ITargetModel,
                private _ctx: IAppModels) {
                    super(identity);
                }

    run(data: any): Promise<IMutationResponse> {
        const that = this;
        let mutationData = data.hasOwnProperty('data') ? data.data : data;

        let targetService = new TargetService(this._ctx.User, this._TargetModel, this._ctx.Chart);
        return new Promise<IMutationResponse>((resolve, reject) => {

            targetService.caculateFormat(mutationData, that._ctx)
                .then((dataTarget) => {
                    mutationData.target = dataTarget;
                    that._TargetModel.updateTarget(data.id, mutationData)
                        .then((theTarget) => {
                            resolve({ success: true, entity: theTarget });
                            return;
                        }).catch((err) => {
                            resolve({ success: false, errors: [ {field: 'target', errors: [err]} ] });
                            return;
                        });
                });
        });
    }

}