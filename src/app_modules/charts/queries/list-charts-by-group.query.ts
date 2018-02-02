import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IChartDocument } from '../../../domain/app/charts/chart';
import { Charts } from '../../../domain/app/charts/chart.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListChartsByGroupActivity } from '../activities/list-charts-by-group.activity';
import { ListChartsQueryResponse } from '../charts.types';


@injectable()
@query({
    name: 'listChartsByGroup',
    activity: ListChartsByGroupActivity,
    parameters: [
        { name: 'group', type: String, required: true },
    ],
    output: { type: ListChartsQueryResponse }
})
export class ListChartsByGroupQuery implements IQuery<IChartDocument[]> {
    constructor(@inject(Charts.name) private _charts: Charts) { }

    run(data: { group: string }): Promise<IChartDocument[]> {
        return this._charts.model.listChartByGroup(data.group);
    }
}
