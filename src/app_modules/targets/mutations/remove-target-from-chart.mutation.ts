import { ITargetModel } from '../../../models/app/targets/ITarget';
import { IIdentity } from '../../../models/app/identity';
import { IMutationResponse } from '../../../models/common/index';
import { MutationBase } from '../../index';
import * as Promise from 'bluebird';

export class RemoveTargetFromChart extends MutationBase<IMutationResponse> {
    constructor(public identity: IIdentity,
                private _TargetModel: ITargetModel) {
                    super(identity);
                }

    run(data: any): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._TargetModel.removeTargetFromChart(data.id)
                .then((deletedTarget) => {
                    resolve({ success: true, entity: deletedTarget});
                    return;
                }).catch((err) => {
                    resolve({ success: false, errors: [ {field: 'target', errors: [err]} ] });
                    return;
                });
        })
    }
}