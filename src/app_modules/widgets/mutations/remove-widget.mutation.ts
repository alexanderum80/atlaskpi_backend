
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Widgets } from '../../../domain';
import { WidgetMutationResponse } from '../widgets.types';
import { RemoveWidgetActivity } from '../activities';

@injectable()
@mutation({
    name: 'removeWidget',
    activity: RemoveWidgetActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: WidgetMutationResponse }
})
export class RemoveWidgetMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Widgets') private _widgets: Widgets) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._widgets.model.removeWidget(data.id)
                .then(widget =>  {
                    resolve({ entity: widget, success: true });
                    return;
                })
                .catch(err => {
                    resolve({success: false, errors: [{ field: 'widget', errors: [err]} ]});
                    return;
                });
        });
    }
}
