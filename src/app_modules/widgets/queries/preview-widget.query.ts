import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Widgets } from '../../../domain/app/widgets/widget.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { WidgetsService } from '../../../services/widgets.service';
import { PreviewWidgetActivity } from '../activities/preview-widget.activity';
import { Widget, WidgetInput } from '../widgets.types';
import { IWidgetInput } from '../../../domain/app/widgets/widget';
import { IUIWidget } from '../../../domain/app/widgets/ui-widget-base';

@injectable()
@query({
    name: 'previewWidget',
    activity: PreviewWidgetActivity,
    parameters: [
        { name: 'input', type: WidgetInput },
    ],
    output: { type: Widget }
})
export class PreviewWidgetQuery implements IQuery<IUIWidget> {
    constructor(
        @inject('Widgets') private _widgets: Widgets,
        @inject('WidgetsService') private _widgetsService: WidgetsService
    ) { }

    run(data: { input: IWidgetInput }): Promise<IUIWidget> {
        return this._widgetsService.previewWidget(data.input);
    }
}
