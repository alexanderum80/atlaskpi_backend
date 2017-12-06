import { WidgetsService } from '../../../services/widgets.service';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Widgets } from '../../../domain';
import { Widget } from '../widgets.types';
import { ListWidgetsActivity } from '../activities';

@injectable()
@query({
    name: 'widgets',
    activity: ListWidgetsActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: Widget }
})
export class WidgetsQuery extends QueryBase<any> {
    constructor(
        @inject('Widgets') private _widgets: Widgets,
        @inject('WidgetsService') private _widgetsService: WidgetsService
    ) {
        super();
    }

    run(data: { id: string }): Promise<any> {
        return this._widgetsService.listWidgets();
    }
}
