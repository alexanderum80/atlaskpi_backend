import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CustomListInput, CustomListMutationResponse } from '../custom-list';
import { CustomList } from '../../../domain/app/custom-list/custom-list.model';
import { ICustomListInput } from '../../../domain/app/custom-list/custom-list';
import { AddCustomListActivity } from '../activities/add-custom-list.activity';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { CustomListService } from '../../../services/custom-list.service';

@injectable()
@mutation({
    name: 'addCustomList',
    activity: AddCustomListActivity,
    parameters: [
        { name: 'input', type: CustomListInput, required: true },
    ],
    output: { type: CustomListMutationResponse }
})
export class AddCustomListMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(CustomListService.name) private _CustomListService: CustomListService
    ) {
    super();
    }

    run(data: { input: ICustomListInput }): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            this._CustomListService.addCustomList(data.input).then(newList => {
                const newListResponse = {
                    name: newList.name,
                    dataType: newList.dataType,
                    user: newList.user,
                    listValue: newList.listValue.map(list => list)
                };
                resolve({ success: true, entity: newListResponse });
            }).catch(err => {
                resolve({ success: false, errors: [{field: 'input', errors: err}] });
            });
        });
    }
}
