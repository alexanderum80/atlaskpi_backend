import { isArray } from 'util';
import { WidgetsService } from '../../../services/widgets.service';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Widgets } from '../../../domain';
import { Widget } from '../widgets.types';
import { ListWidgetsActivity } from '../activities';

@injectable()
@query({
    name: 'widgets',
    activity: ListWidgetsActivity,
    output: { type: Widget, isArray: true }
})
export class WidgetsQuery implements IQuery<any> {
    constructor(
        @inject('Widgets') private _widgets: Widgets,
        @inject('WidgetsService') private _widgetsService: WidgetsService
    ) {
        
    }

    run(data: { id: string }): Promise<any> {
        return this._widgetsService.listWidgets();
    }
}
