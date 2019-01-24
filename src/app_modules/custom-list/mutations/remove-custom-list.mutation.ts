import { CustomListService } from './../../../services/custom-list.service';
import { CustomListMutationResponse } from '../custom-list';
import { CustomList } from '../../../domain/app/custom-list/custom-list.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { RemoveCustomListActivity } from '../activities/remove-custom-list.activity';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';

@injectable()
@mutation({
    name: 'removeCustomList',
    activity: RemoveCustomListActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: CustomListMutationResponse }
})
export class RemoveCustomListMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(CustomListService.name) private _customListSrv: CustomListService
    ) {
    super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {

            this._customListSrv.removeCustomList(data.id).then(res => {
                if (res) {
                    resolve({ success: true, errors: [] });
                    return;
                } else {
                    resolve({ success: false, errors: [] });
                    return;
                }
            }).catch(err => {
                resolve({ success: false, errors: [{field: 'input', errors: [err]}] });
                return;
            });
        });
    }
}
