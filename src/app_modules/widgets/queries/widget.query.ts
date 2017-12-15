import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Widgets } from '../../../domain/app/widgets/widget.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetWidgetActivity } from '../activities/get-widget.activity';
import { Widget } from '../widgets.types';

@injectable()
@query({
    name: 'widget',
    activity: GetWidgetActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: Widget }
})
export class WidgetQuery implements IQuery<Widget> {
    constructor(@inject('Widgets') private _widgets: Widgets) { }

    run(data: { id: string }): Promise<Widget> {
        return this._widgets.model.getWidgetById(data.id);
    }
}
