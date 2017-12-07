import { WidgetsService } from '../../../services/widgets.service';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Widgets } from '../../../domain';
import { Widget, WidgetInput } from '../widgets.types';
import { PreviewWidgetActivity } from '../activities';

@injectable()
@query({
    name: 'previewWidget',
    activity: PreviewWidgetActivity,
    parameters: [
        { name: 'input', type: WidgetInput },
    ],
    output: { type: Widget }
})
export class PreviewWidgetQuery implements IQuery<Widget> {
    constructor(
        @inject('Widgets') private _widgets: Widgets,
        @inject('WidgetsService') private _widgetsService: WidgetsService
    ) {
        
    }

    run(data: { input: WidgetInput }): Promise<Widget> {
        return this._widgetsService.previewWidget(data.input);
    }
}
