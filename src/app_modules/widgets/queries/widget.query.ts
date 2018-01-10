import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IUIWidget } from '../../../domain/app/widgets/ui-widget-base';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetWidgetActivity } from '../activities/get-widget.activity';
import { Widget } from '../widgets.types';
import { WidgetsService } from './../../../services/widgets.service';

@injectable()
@query({
    name: 'widget',
    activity: GetWidgetActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: Widget }
})
export class WidgetQuery implements IQuery<IUIWidget> {
    constructor(
        @inject(WidgetsService.name) private _widgetsService: WidgetsService
    ) { }

    run(data: { id: string }): Promise<IUIWidget> {
        return this._widgetsService.getWidgetById(data.id);
    }
}
