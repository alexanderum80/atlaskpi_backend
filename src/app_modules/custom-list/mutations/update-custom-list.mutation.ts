import { UpdateCustomListActivity } from '../activities/update-custom-list.activity';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CustomListInput, CustomListMutationResponse } from '../custom-list';
import { ICustomListInput } from '../../../domain/app/custom-list/custom-list';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { CustomListService } from '../../../services/custom-list.service';

@injectable()
@mutation({
    name: 'updateCustomList',
    activity: UpdateCustomListActivity,
    parameters: [
        { name: 'input', type: CustomListInput, required: true },
    ],
    output: { type: CustomListMutationResponse }
})
export class UpdateCustomListMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(CustomListService.name) private _CustomListService: CustomListService
    ) {
    super();
    }

    run(data: { input: ICustomListInput }): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            this._CustomListService.updateCustomList(data.input).then(customList => {
                    resolve({ success: true, entity: customList });
                }).catch(err => {
                    resolve({ success: false, errors: [{field: 'input', errors: err}] });
                });
            });
    }
}
