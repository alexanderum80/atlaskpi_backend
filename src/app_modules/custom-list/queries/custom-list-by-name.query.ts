import { CustomListByNameActivity } from './../activities/custom-list-by-name.activity.1';
import { ICustomListResponse } from '../custom-list';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { CustomListService } from '../../../services/custom-list.service';


@injectable()
@query({
    name: 'customListByName',
    activity: CustomListByNameActivity,
    parameters: [
        { name: 'name', type: String, required: false }
    ],
    output: { type: ICustomListResponse }
})
export class CustomListByNameQuery implements IQuery<ICustomListResponse> {
    constructor(@inject(CustomListService.name) private _CustomListService: CustomListService) { }

    async run(data: { name: string }): Promise<ICustomListResponse> {
        return this._CustomListService.customListByName(data.name).then(res => {
            if (res) {
                return {
                    _id: res._id,
                    name: res.name,
                    dataType: res.dataType,
                    user: res.user,
                    listValue: res.listValue
                };
            } else {
                return null;
            }
        });
    }
}