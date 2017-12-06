
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Widgets } from '../../../domain';
import { Widget } from '../widgets.types';
import { GetWidgetActivity } from '../activities';

@injectable()
@query({
    name: 'widget',
    activity: GetWidgetActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: Widget }
})
export class WidgetQuery extends QueryBase<Widget> {
    constructor(@inject('Widgets') private _widgets: Widgets) {
        super();
    }

    run(data: { id: string }): Promise<Widget> {
        return this._widgets.model.getWidgetById(data.id);
    }
}
