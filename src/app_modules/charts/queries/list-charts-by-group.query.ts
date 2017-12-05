
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Charts, IChartDocument } from '../../../domain';
import { ListChartsQueryResponse } from '../charts.types';
import { ListChartsByGroupActivity } from '../activities';

@injectable()
@query({
    name: 'listChartsByGroup',
    activity: ListChartsByGroupActivity,
    parameters: [
        { name: 'group', type: String, required: true },
    ],
    output: { type: ListChartsQueryResponse }
})
export class ListChartsByGroupQuery extends QueryBase<IChartDocument[]> {
    constructor(@inject('Charts') private _charts: Charts) {
        super();
    }

    run(data: { group: string }): Promise<IChartDocument[]> {
        return this._charts.model.listChartByGroup(data.group);
    }
}
