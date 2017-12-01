import { TargetService } from '../../../services/targets/target.service';
import { KpiFactory } from '../../../queries/app/kpis';
import { IDateRange } from '../../../models/common';
import { parsePredifinedDate } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import { ITargetModel } from '../../../models/app/targets/ITarget';
import { IIdentity } from '../../../models/app/identity';
import { IMutationResponse } from '../../../models/common/mutation-response';
import { MutationBase } from '../../mutation-base';
import * as Promise from 'bluebird';
import * as moment from 'moment';


export class CreateTargetMutation extends MutationBase<IMutationResponse> {

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
            targetService.caculateFormat(mutationData, this._ctx)
                .then((dataTarget) => {
                    mutationData.target = dataTarget;

                    that._TargetModel.createTarget(mutationData)
                        .then((target) => {
                            resolve({ entity: target, success: true });
                            return;
                        }).catch((err) => {
                            resolve({ success: false, errors: [ {field: 'target', errors: [err]} ] });
                            return;
                        });
                });
        });
    }

}