import { ICustomListResponse } from '../custom-list';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetCustomListActivity } from '../activities/get-custom-list.activity';
import { CustomListService } from '../../../services/custom-list.service';


@injectable()
@query({
    name: 'customList',
    activity: GetCustomListActivity,
    parameters: [
        { name: 'id', type: String, required: false }
    ],
    output: { type: ICustomListResponse, isArray: true }
})
export class CustomListQuery implements IQuery<ICustomListResponse[]> {
    constructor(@inject(CustomListService.name) private _CustomListService: CustomListService) { }

    async run(data: { id?: string }): Promise<ICustomListResponse[]> {
        return this._CustomListService.getCustomList(data.id).then(res => {
            return res.map(list => {
                return {
                    _id: list._id,
                    name: list.name,
                    dataType: list.dataType,
                    listValue: list.listValue,
                    users: list.users
                };
            });
        });
    }
}