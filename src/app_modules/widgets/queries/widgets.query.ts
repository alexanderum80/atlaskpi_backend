import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Widgets } from '../../../domain/app/widgets/widget.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { WidgetsService } from '../../../services/widgets.service';
import { ListWidgetsActivity } from '../activities/list-widgets.activity';
import { Widget } from '../widgets.types';

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
    ) { }

    run(data: { id: string }): Promise<any> {
        return this._widgetsService.listWidgets();
    }
}
