import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IUIWidget } from '../../../domain/app/widgets/ui-widget-base';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { Widget } from '../widgets.types';
import { WidgetsService } from './../../../services/widgets.service';
import { GetWidgetByNameActivity } from '../activities/get-widget-by-name.activity';

@injectable()
@query({
    name: 'widgetByName',
    activity: GetWidgetByNameActivity,
    parameters: [
        { name: 'name', type: String, required: true },
    ],
    output: { type: Widget }
})
export class WidgetByNameQuery implements IQuery<IUIWidget> {
    constructor(
        @inject(WidgetsService.name) private _widgetsService: WidgetsService
    ) { }

    run(data: { name: string }): Promise<IUIWidget> {
        return this._widgetsService.getWidgetByName(data.name);
    }
}
